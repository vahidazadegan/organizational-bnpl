package com.organizational.bnpl.panel.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record UserCreditResponse(
		UUID id,
		UUID userId,
		UUID organizationId,
		Long creditLimit,
		Long usedCredit,
		BigDecimal annualInterestRate,
		Integer repaymentMonths,
		String currency,
		String status,
		Instant validFrom,
		Instant validUntil,
		Instant createdAt,
		Instant updatedAt
) {
}
