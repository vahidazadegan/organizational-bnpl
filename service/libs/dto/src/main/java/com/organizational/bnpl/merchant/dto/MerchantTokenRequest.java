package com.organizational.bnpl.merchant.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record MerchantTokenRequest(
		@NotBlank @Size(max = 64) String accessId,
		@NotBlank @Size(max = 200) String accessKey
) {
}
