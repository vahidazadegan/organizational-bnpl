package com.organizational.bnpl.panel.dto;

import com.organizational.bnpl.panel.domain.PurchaseStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/**
 * Compact purchase row for paginated list views (no installment schedule).
 */
public record PurchaseSummaryResponse(
		UUID id,
		UUID userId,
		String userFirstName,
		String userLastName,
		String userNationalId,
		String userMobile,
		UUID organizationId,
		UUID userCreditId,
		UUID merchantId,
		String shopName,
		String description,
		Long amount,
		String currency,
		BigDecimal annualInterestRate,
		Integer repaymentMonths,
		PurchaseStatus status,
		String orderNumber,
		String externalReference,
		Instant purchasedAt,
		Instant createdAt,
		Instant updatedAt
) {
}
