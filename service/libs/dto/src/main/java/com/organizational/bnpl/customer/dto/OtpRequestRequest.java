package com.organizational.bnpl.customer.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record OtpRequestRequest(
		@NotBlank
		@Pattern(regexp = "^09\\d{9}$", message = "mobile must be an Iranian mobile number")
		String mobile
) {
}
