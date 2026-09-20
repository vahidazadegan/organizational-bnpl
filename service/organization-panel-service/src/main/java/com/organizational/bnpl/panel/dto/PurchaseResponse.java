package com.organizational.bnpl.panel.dto;

import com.organizational.bnpl.panel.domain.PurchaseStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record PurchaseResponse(
		UUID id,
		UUID userId,
		UUID organizationId,
		UUID userCreditId,
		UUID merchantId,
		String shopName,
		String description,
		Long amount,
		String currency,
		BigDecimal annualInterestRate,
		Integer repaymentMonths,
		Long totalPayable,
		PurchaseStatus status,
		String orderNumber,
		String externalReference,
		Instant purchasedAt,
		Instant createdAt,
		Instant updatedAt,
		List<InstallmentResponse> installments
) {
}
