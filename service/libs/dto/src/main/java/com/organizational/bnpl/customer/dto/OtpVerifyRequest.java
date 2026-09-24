package com.organizational.bnpl.customer.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record OtpVerifyRequest(
		@NotBlank
		@Pattern(regexp = "^09\\d{9}$", message = "mobile must be an Iranian mobile number")
		String mobile,
		@NotBlank
		@Pattern(regexp = "^\\d{4,8}$", message = "code must be 4-8 digits")
		String code
) {
}
