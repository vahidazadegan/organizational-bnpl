package com.organizational.bnpl.panel.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record CreatePurchaseRequest(
		@NotNull UUID userCreditId,
		@NotNull @Positive Long amount,
		UUID merchantId,
		@Size(max = 200) String shopName,
		@Size(max = 500) String description,
		@Size(max = 100) String orderNumber,
		@Size(max = 100) String externalReference
) {
}
