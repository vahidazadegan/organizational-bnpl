package com.organizational.bnpl.merchant.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ConfirmPurchaseRequest(
		@NotBlank @Size(min = 4, max = 8) String otp
) {
}
