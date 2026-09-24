package com.organizational.bnpl.merchant.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record InitiatePurchaseRequest(
		@NotBlank @Size(max = 15) String mobile,
		@NotBlank @Size(max = 50) String organizationCode,
		@NotNull @Min(1) Long amount,
		@Size(max = 100) String orderNumber,
		@Size(max = 100) String externalReference,
		@Size(max = 500) String description,
		@Size(max = 200) String shopName
) {
}
