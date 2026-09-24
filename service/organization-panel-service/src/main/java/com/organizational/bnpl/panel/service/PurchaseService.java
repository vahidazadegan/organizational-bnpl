package com.organizational.bnpl.panel.service;

import com.organizational.bnpl.panel.domain.Installment;
import com.organizational.bnpl.panel.domain.Purchase;
import com.organizational.bnpl.panel.domain.PurchaseStatus;
import com.organizational.bnpl.panel.dto.InstallmentResponse;
import com.organizational.bnpl.panel.dto.PageResponse;
import com.organizational.bnpl.panel.dto.PurchaseSummaryResponse;
import com.organizational.bnpl.panel.exception.BadRequestException;
import com.organizational.bnpl.panel.exception.NotFoundException;
import com.organizational.bnpl.panel.mapper.InstallmentMapper;
import com.organizational.bnpl.panel.mapper.PurchaseMapper;
import com.organizational.bnpl.panel.repository.InstallmentRepository;
import com.organizational.bnpl.panel.repository.PurchaseRepository;
import com.organizational.bnpl.panel.repository.specification.PurchaseSpecifications;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PurchaseService {

	private static final int DEFAULT_PAGE = 1;
	private static final int DEFAULT_SIZE = 8;
	private static final int MAX_SIZE = 100;
	private static final Set<String> ALLOWED_STATUSES = Arrays.stream(PurchaseStatus.values())
			.map(Enum::name)
			.collect(Collectors.toUnmodifiableSet());

	private final PurchaseRepository purchaseRepository;
	private final InstallmentRepository installmentRepository;
	private final PurchaseMapper purchaseMapper;
	private final InstallmentMapper installmentMapper;

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
