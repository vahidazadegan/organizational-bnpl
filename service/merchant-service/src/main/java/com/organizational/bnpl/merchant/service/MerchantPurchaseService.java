package com.organizational.bnpl.merchant.service;

import com.organizational.bnpl.admin.domain.Merchant;
import com.organizational.bnpl.common.InstallmentScheduleCalculator;
import com.organizational.bnpl.merchant.config.OtpProperties;
import com.organizational.bnpl.merchant.dto.ConfirmPurchaseRequest;
import com.organizational.bnpl.merchant.dto.InitiatePurchaseRequest;
import com.organizational.bnpl.merchant.dto.InitiatePurchaseResponse;
import com.organizational.bnpl.merchant.exception.BadRequestException;
import com.organizational.bnpl.merchant.exception.ConflictException;
import com.organizational.bnpl.merchant.exception.NotFoundException;
import com.organizational.bnpl.merchant.mapper.InstallmentMapper;
import com.organizational.bnpl.merchant.mapper.PurchaseMapper;
import com.organizational.bnpl.merchant.repository.CreditTransactionRepository;
import com.organizational.bnpl.merchant.repository.InstallmentRepository;
import com.organizational.bnpl.merchant.repository.MerchantRepository;
import com.organizational.bnpl.merchant.repository.OrganizationRepository;
import com.organizational.bnpl.merchant.repository.PurchaseRepository;
import com.organizational.bnpl.merchant.repository.UserCreditRepository;
import com.organizational.bnpl.merchant.repository.UserRepository;
import com.organizational.bnpl.panel.domain.CreditTransaction;
import com.organizational.bnpl.panel.domain.CreditTransactionType;
import com.organizational.bnpl.panel.domain.Installment;
import com.organizational.bnpl.panel.domain.InstallmentStatus;
import com.organizational.bnpl.panel.domain.Purchase;
import com.organizational.bnpl.panel.domain.PurchaseStatus;
import com.organizational.bnpl.panel.domain.User;
import com.organizational.bnpl.panel.domain.UserCredit;
import com.organizational.bnpl.panel.domain.identity.Organization;
import com.organizational.bnpl.panel.dto.InstallmentResponse;
import com.organizational.bnpl.panel.dto.PurchaseResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class MerchantPurchaseService {

	private static final ZoneId TEHRAN = ZoneId.of("Asia/Tehran");
	private static final String ACTIVE_STATUS = "ACTIVE";
	private static final String REFERENCE_TYPE_PURCHASE = "PURCHASE";

	private final MerchantRepository merchantRepository;
	private final OrganizationRepository organizationRepository;
	private final UserRepository userRepository;
	private final UserCreditRepository userCreditRepository;
	private final PurchaseRepository purchaseRepository;
	private final InstallmentRepository installmentRepository;
	private final CreditTransactionRepository creditTransactionRepository;
	private final PurchaseMapper purchaseMapper;
	private final InstallmentMapper installmentMapper;
	private final PasswordEncoder passwordEncoder;
	private final OtpProperties otpProperties;
	private final SecureRandom secureRandom = new SecureRandom();

	@Transactional
	public InitiatePurchaseResponse initiate(UUID merchantId, InitiatePurchaseRequest request) {
		Merchant merchant = requireActiveMerchant(merchantId);

		Organization organization = organizationRepository.findByCode(request.organizationCode().trim())
				.orElseThrow(() -> new NotFoundException("سازمان یافت نشد"));

		if (!ACTIVE_STATUS.equalsIgnoreCase(organization.getStatus())) {
			throw new BadRequestException("سازمان فعال نیست");
		}

		User user = userRepository.findByMobile(normalizeMobile(request.mobile()))
				.orElseThrow(() -> new NotFoundException("کاربر با این موبایل یافت نشد"));

		UserCredit credit = userCreditRepository
				.findByUserIdAndOrganizationIdForUpdate(user.getId(), organization.getId())
				.orElseThrow(() -> new NotFoundException("اعتبار کاربر برای این سازمان یافت نشد"));

		validateCredit(credit);

		long available = availableCredit(credit);
		if (request.amount() > available) {
			throw new BadRequestException("موجودی اعتبار کافی نیست");
		}

		String orderNumber = blankToNull(request.orderNumber());
		if (orderNumber != null
				&& purchaseRepository.existsByMerchantIdAndOrderNumber(merchantId, orderNumber)) {
			throw new ConflictException("شماره سفارش تکراری است");
		}

		String otp = resolveOtpCode();
		Instant now = Instant.now();
		Instant otpExpiresAt = now.plusSeconds(otpProperties.ttlSeconds());

		Purchase purchase = new Purchase();
		purchase.setUser(user);
		purchase.setOrganization(organization);
		purchase.setUserCredit(credit);
		purchase.setMerchantId(merchantId);
		purchase.setShopName(resolveShopName(request.shopName(), merchant.getName()));
		purchase.setDescription(blankToNull(request.description()));
		purchase.setAmount(request.amount());
		purchase.setCurrency(credit.getCurrency());
		purchase.setAnnualInterestRate(credit.getAnnualInterestRate());
		purchase.setRepaymentMonths(credit.getRepaymentMonths());
		purchase.setStatus(PurchaseStatus.PENDING);
		purchase.setOrderNumber(orderNumber);
		purchase.setExternalReference(blankToNull(request.externalReference()));
		purchase.setOtpHash(passwordEncoder.encode(otp));
		purchase.setOtpExpiresAt(otpExpiresAt);
		purchase.setOtpAttemptCount(0);
		purchase.setPurchasedAt(now);
		purchase = purchaseRepository.save(purchase);

		long balanceBefore = available;
		long balanceAfter = available - request.amount();
		credit.setReservedCredit(credit.getReservedCredit() + request.amount());
		userCreditRepository.save(credit);

		CreditTransaction transaction = new CreditTransaction();
		transaction.setUserCredit(credit);
		transaction.setType(CreditTransactionType.CREDIT_RESERVED);
		transaction.setAmount(request.amount());
		transaction.setBalanceBefore(balanceBefore);
		transaction.setBalanceAfter(balanceAfter);
		transaction.setReferenceType(REFERENCE_TYPE_PURCHASE);
		transaction.setReferenceId(purchase.getId());
		transaction.setDescription("رزرو اعتبار بابت اعلام خرید پذیرنده");
		creditTransactionRepository.save(transaction);

		log.info("Purchase OTP for purchaseId={} mobile={}: {}", purchase.getId(), user.getMobile(), otp);

		return new InitiatePurchaseResponse(
				purchase.getId(),
				purchase.getStatus(),
				otpExpiresAt,
				otpProperties.ttlSeconds());
	}

	@Transactional
	public PurchaseResponse confirm(UUID merchantId, UUID purchaseId, ConfirmPurchaseRequest request) {
		requireActiveMerchant(merchantId);

		Purchase purchase = purchaseRepository.findByIdAndMerchantIdForUpdate(purchaseId, merchantId)
				.orElseThrow(() -> new NotFoundException("خرید یافت نشد"));

		if (purchase.getStatus() != PurchaseStatus.PENDING) {
			throw new BadRequestException("خرید در وضعیت قابل تأیید نیست");
		}

		UserCredit credit = userCreditRepository.findByIdForUpdate(purchase.getUserCredit().getId())
				.orElseThrow(() -> new NotFoundException("اعتبار کاربر یافت نشد"));

		Instant now = Instant.now();
		if (purchase.getOtpExpiresAt() == null || now.isAfter(purchase.getOtpExpiresAt())) {
			cancelPendingPurchase(purchase, credit, "انقضای OTP");
			throw new BadRequestException("کد تأیید منقضی شده است");
		}

		if (!passwordEncoder.matches(request.otp().trim(), purchase.getOtpHash())) {
			int attempts = purchase.getOtpAttemptCount() == null ? 0 : purchase.getOtpAttemptCount();
			attempts += 1;
			purchase.setOtpAttemptCount(attempts);
			if (attempts >= otpProperties.maxAttempts()) {
				cancelPendingPurchase(purchase, credit, "تجاوز از حداکثر تلاش OTP");
				throw new BadRequestException("تعداد تلاش‌های نامعتبر بیش از حد مجاز است؛ خرید لغو شد");
			}
			purchaseRepository.save(purchase);
			throw new BadRequestException("کد تأیید نامعتبر است");
		}

		validateCredit(credit);

		long availableIncludingReservation = availableCredit(credit) + purchase.getAmount();
		if (purchase.getAmount() > availableIncludingReservation) {
			cancelPendingPurchase(purchase, credit, "کمبود موجودی در تأیید");
			throw new BadRequestException("موجودی اعتبار کافی نیست");
		}

		LocalDate firstDueDate = LocalDate.ofInstant(purchase.getPurchasedAt(), TEHRAN).plusMonths(1);
		InstallmentScheduleCalculator.Schedule schedule;
		try {
			schedule = InstallmentScheduleCalculator.calculate(
					purchase.getAmount(),
					purchase.getAnnualInterestRate(),
					purchase.getRepaymentMonths(),
					firstDueDate);
		} catch (IllegalArgumentException ex) {
			throw new BadRequestException(ex.getMessage());
		}

		long availableBeforeConsume = availableCredit(credit) + purchase.getAmount();
		credit.setReservedCredit(Math.max(0L, credit.getReservedCredit() - purchase.getAmount()));
		credit.setUsedCredit(credit.getUsedCredit() + purchase.getAmount());
		userCreditRepository.save(credit);

		CreditTransaction reservedTx = creditTransactionRepository.findByReferenceId(purchase.getId())
				.orElseGet(CreditTransaction::new);
		reservedTx.setUserCredit(credit);
		reservedTx.setType(CreditTransactionType.CREDIT_CONSUMED);
		reservedTx.setAmount(purchase.getAmount());
		reservedTx.setBalanceBefore(availableBeforeConsume);
		reservedTx.setBalanceAfter(availableCredit(credit));
		reservedTx.setReferenceType(REFERENCE_TYPE_PURCHASE);
		reservedTx.setReferenceId(purchase.getId());
		reservedTx.setDescription("مصرف اعتبار پس از تأیید OTP خرید پذیرنده");
		creditTransactionRepository.save(reservedTx);

		List<Installment> installments = new ArrayList<>(schedule.plans().size());
		for (InstallmentScheduleCalculator.InstallmentPlan plan : schedule.plans()) {
			Installment installment = new Installment();
			installment.setPurchase(purchase);
			installment.setInstallmentNumber(plan.number());
			installment.setAmount(plan.amount());
			installment.setPaidAmount(0L);
			installment.setDueDate(plan.dueDate());
			installment.setStatus(InstallmentStatus.PENDING);
			installments.add(installment);
		}
		installments = installmentRepository.saveAll(installments);

		purchase.setStatus(PurchaseStatus.COMPLETED);
		purchase.setOtpHash(null);
		purchase.setOtpExpiresAt(null);
		purchase = purchaseRepository.save(purchase);

		List<InstallmentResponse> installmentResponses = installments.stream()
				.map(installmentMapper::toResponse)
				.toList();

		return purchaseMapper.toResponse(purchase, schedule.totalPayable(), installmentResponses);
	}

	private void cancelPendingPurchase(Purchase purchase, UserCredit credit, String reason) {
		if (purchase.getStatus() != PurchaseStatus.PENDING) {
			return;
		}

		long availableBefore = availableCredit(credit);
		credit.setReservedCredit(Math.max(0L, credit.getReservedCredit() - purchase.getAmount()));
		userCreditRepository.save(credit);

		CreditTransaction reservedTx = creditTransactionRepository.findByReferenceId(purchase.getId())
				.orElseGet(CreditTransaction::new);
		reservedTx.setUserCredit(credit);
		reservedTx.setType(CreditTransactionType.CREDIT_RELEASED);
		reservedTx.setAmount(purchase.getAmount());
		reservedTx.setBalanceBefore(availableBefore);
		reservedTx.setBalanceAfter(availableCredit(credit));
		reservedTx.setReferenceType(REFERENCE_TYPE_PURCHASE);
		reservedTx.setReferenceId(purchase.getId());
		reservedTx.setDescription("آزادسازی رزرو اعتبار: " + reason);
		creditTransactionRepository.save(reservedTx);

		purchase.setStatus(PurchaseStatus.CANCELLED);
		purchase.setOtpHash(null);
		purchase.setOtpExpiresAt(null);
		purchaseRepository.save(purchase);
	}

	private Merchant requireActiveMerchant(UUID merchantId) {
		Merchant merchant = merchantRepository.findById(merchantId)
				.orElseThrow(() -> new NotFoundException("پذیرنده یافت نشد"));
		if (!ACTIVE_STATUS.equalsIgnoreCase(merchant.getStatus())) {
			throw new BadRequestException("پذیرنده غیرفعال است");
		}
		return merchant;
	}

	private void validateCredit(UserCredit credit) {
		if (!ACTIVE_STATUS.equalsIgnoreCase(credit.getStatus())) {
			throw new BadRequestException("اعتبار کاربر فعال نیست");
		}
		if (credit.getRepaymentMonths() == null || credit.getRepaymentMonths() <= 0) {
			throw new BadRequestException("تعداد ماه بازپرداخت روی اعتبار تنظیم نشده است");
		}

		Instant now = Instant.now();
		if (credit.getValidFrom() != null && now.isBefore(credit.getValidFrom())) {
			throw new BadRequestException("اعتبار هنوز شروع نشده است");
		}
		if (credit.getValidUntil() != null && now.isAfter(credit.getValidUntil())) {
			throw new BadRequestException("اعتبار منقضی شده است");
		}
	}

	private static long availableCredit(UserCredit credit) {
		long reserved = credit.getReservedCredit() == null ? 0L : credit.getReservedCredit();
		long used = credit.getUsedCredit() == null ? 0L : credit.getUsedCredit();
		return credit.getCreditLimit() - used - reserved;
	}

	private String resolveOtpCode() {
		String fixed = otpProperties.fixedCode();
		if (fixed != null && !fixed.isBlank()) {
			return fixed.trim();
		}
		int length = Math.max(4, Math.min(8, otpProperties.length()));
		int bound = (int) Math.pow(10, length);
		int value = secureRandom.nextInt(bound / 10, bound);
		return String.valueOf(value);
	}

	private static String resolveShopName(String requested, String merchantName) {
		String shopName = blankToNull(requested);
		return shopName != null ? shopName : merchantName;
	}

	private static String normalizeMobile(String mobile) {
		String value = mobile.trim();
		if (!StringUtils.hasText(value)) {
			throw new BadRequestException("موبایل الزامی است");
		}
		return value;
	}

	private static String blankToNull(String value) {
		if (!StringUtils.hasText(value)) {
			return null;
		}
		return value.trim();
	}
}
