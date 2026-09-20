package com.organizational.bnpl.panel.service;

import com.organizational.bnpl.panel.domain.CreditTransaction;
import com.organizational.bnpl.panel.domain.CreditTransactionType;
import com.organizational.bnpl.panel.domain.Installment;
import com.organizational.bnpl.panel.domain.InstallmentStatus;
import com.organizational.bnpl.panel.domain.Purchase;
import com.organizational.bnpl.panel.domain.PurchaseStatus;
import com.organizational.bnpl.panel.domain.UserCredit;
import com.organizational.bnpl.panel.dto.CreatePurchaseRequest;
import com.organizational.bnpl.panel.dto.InstallmentResponse;
import com.organizational.bnpl.panel.dto.PageResponse;
import com.organizational.bnpl.panel.dto.PurchaseResponse;
import com.organizational.bnpl.panel.dto.PurchaseSummaryResponse;
import com.organizational.bnpl.panel.exception.BadRequestException;
import com.organizational.bnpl.panel.exception.NotFoundException;
import com.organizational.bnpl.panel.mapper.InstallmentMapper;
import com.organizational.bnpl.panel.mapper.PurchaseMapper;
import com.organizational.bnpl.panel.repository.CreditTransactionRepository;
import com.organizational.bnpl.panel.repository.InstallmentRepository;
import com.organizational.bnpl.panel.repository.PurchaseRepository;
import com.organizational.bnpl.panel.repository.UserCreditRepository;
import com.organizational.bnpl.panel.repository.specification.PurchaseSpecifications;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PurchaseService {

	private static final ZoneId TEHRAN = ZoneId.of("Asia/Tehran");
	private static final String ACTIVE_STATUS = "ACTIVE";
	private static final String REFERENCE_TYPE_PURCHASE = "PURCHASE";
	private static final int DEFAULT_PAGE = 1;
	private static final int DEFAULT_SIZE = 8;
	private static final int MAX_SIZE = 100;
	private static final Set<String> ALLOWED_STATUSES = Arrays.stream(PurchaseStatus.values())
			.map(Enum::name)
			.collect(Collectors.toUnmodifiableSet());

	private final UserCreditRepository userCreditRepository;
	private final PurchaseRepository purchaseRepository;
	private final InstallmentRepository installmentRepository;
	private final CreditTransactionRepository creditTransactionRepository;
	private final PurchaseMapper purchaseMapper;
	private final InstallmentMapper installmentMapper;

	@Transactional
	public PurchaseResponse create(CreatePurchaseRequest request, UUID organizationId) {
		UserCredit credit = userCreditRepository
				.findByIdAndOrganizationIdForUpdate(request.userCreditId(), organizationId)
				.orElseThrow(() -> new NotFoundException("اعتبار کاربر یافت نشد"));

		validateCredit(credit);

		long available = credit.getCreditLimit() - credit.getUsedCredit();
		if (request.amount() > available) {
			throw new BadRequestException("موجودی اعتبار کافی نیست");
		}

		Instant purchasedAt = Instant.now();
		LocalDate firstDueDate = LocalDate.ofInstant(purchasedAt, TEHRAN).plusMonths(1);

		InstallmentScheduleCalculator.Schedule schedule = InstallmentScheduleCalculator.calculate(
				request.amount(),
				credit.getAnnualInterestRate(),
				credit.getRepaymentMonths(),
				firstDueDate);

		Purchase purchase = new Purchase();
		purchase.setUser(credit.getUser());
		purchase.setOrganization(credit.getOrganization());
		purchase.setUserCredit(credit);
		purchase.setMerchantId(request.merchantId());
		purchase.setShopName(request.shopName());
		purchase.setDescription(request.description());
		purchase.setAmount(request.amount());
		purchase.setCurrency(credit.getCurrency());
		purchase.setAnnualInterestRate(credit.getAnnualInterestRate());
		purchase.setRepaymentMonths(credit.getRepaymentMonths());
		purchase.setStatus(PurchaseStatus.COMPLETED);
		purchase.setOrderNumber(request.orderNumber());
		purchase.setExternalReference(request.externalReference());
		purchase.setPurchasedAt(purchasedAt);
		purchase = purchaseRepository.save(purchase);

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

		long balanceBefore = available;
		long balanceAfter = available - request.amount();
		credit.setUsedCredit(credit.getUsedCredit() + request.amount());
		userCreditRepository.save(credit);

		CreditTransaction transaction = new CreditTransaction();
		transaction.setUserCredit(credit);
		transaction.setType(CreditTransactionType.CREDIT_CONSUMED);
		transaction.setAmount(request.amount());
		transaction.setBalanceBefore(balanceBefore);
		transaction.setBalanceAfter(balanceAfter);
		transaction.setReferenceType(REFERENCE_TYPE_PURCHASE);
		transaction.setReferenceId(purchase.getId());
		transaction.setDescription("مصرف اعتبار بابت خرید");
		creditTransactionRepository.save(transaction);

		List<InstallmentResponse> installmentResponses = installments.stream()
				.map(installmentMapper::toResponse)
				.toList();

		return purchaseMapper.toResponse(purchase, schedule.totalPayable(), installmentResponses);
	}

	@Transactional(readOnly = true)
	public PageResponse<PurchaseSummaryResponse> search(
			UUID organizationId,
			String name,
			String mobile,
			String nationalId,
			String status,
			String orderNumber,
			String shopName,
			Integer page,
			Integer size) {
		int pageNumber = normalizePage(page);
		int pageSize = normalizeSize(size);
		PurchaseStatus normalizedStatus = normalizeStatus(status);

		PageRequest pageable = PageRequest.of(
				pageNumber - 1,
				pageSize,
				Sort.by(Sort.Direction.DESC, "purchasedAt"));

		Page<Purchase> result = purchaseRepository.findAll(
				PurchaseSpecifications.withFilters(
						organizationId,
						blankToNull(name),
						blankToNull(mobile),
						blankToNull(nationalId),
						normalizedStatus,
						blankToNull(orderNumber),
						blankToNull(shopName)),
				pageable);

		return PageResponse.map(result, pageNumber, purchaseMapper::toSummary);
	}

	@Transactional(readOnly = true)
	public PageResponse<InstallmentResponse> listInstallments(
			UUID purchaseId,
			UUID organizationId,
			Integer page,
			Integer size) {
		if (!purchaseRepository.existsByIdAndOrganizationId(purchaseId, organizationId)) {
			throw new NotFoundException("خرید یافت نشد");
		}

		int pageNumber = normalizePage(page);
		int pageSize = normalizeSize(size);
		PageRequest pageable = PageRequest.of(
				pageNumber - 1,
				pageSize,
				Sort.by(Sort.Direction.ASC, "installmentNumber"));

		Page<Installment> result = installmentRepository.findByPurchaseId(purchaseId, pageable);
		return PageResponse.map(result, pageNumber, installmentMapper::toResponse);
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

	private int normalizePage(Integer page) {
		if (page == null) {
			return DEFAULT_PAGE;
		}
		if (page < 1) {
			throw new BadRequestException("شماره صفحه باید از ۱ شروع شود");
		}
		return page;
	}

	private int normalizeSize(Integer size) {
		if (size == null) {
			return DEFAULT_SIZE;
		}
		if (size < 1 || size > MAX_SIZE) {
			throw new BadRequestException("اندازه صفحه باید بین ۱ تا " + MAX_SIZE + " باشد");
		}
		return size;
	}

	private PurchaseStatus normalizeStatus(String status) {
		String value = blankToNull(status);
		if (value == null) {
			return null;
		}
		String normalized = value.trim().toUpperCase(Locale.ROOT);
		if (!ALLOWED_STATUSES.contains(normalized)) {
			throw new BadRequestException(
					"وضعیت نامعتبر است؛ مقادیر مجاز: " + String.join("، ", ALLOWED_STATUSES));
		}
		return PurchaseStatus.valueOf(normalized);
	}

	private String blankToNull(String value) {
		if (value == null) {
			return null;
		}
		String trimmed = value.trim();
		return trimmed.isEmpty() ? null : trimmed;
	}
}
