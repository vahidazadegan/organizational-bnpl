package com.organizational.bnpl.merchant.dto;

import com.organizational.bnpl.panel.domain.PurchaseStatus;

import java.time.Instant;
import java.util.UUID;

public record InitiatePurchaseResponse(
		UUID purchaseId,
		PurchaseStatus status,
		Instant otpExpiresAt,
		long otpTtlSeconds
) {
}
