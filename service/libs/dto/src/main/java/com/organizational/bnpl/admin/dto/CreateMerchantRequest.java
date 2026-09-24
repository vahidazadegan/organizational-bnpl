package com.organizational.bnpl.admin.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateMerchantRequest(
		@NotBlank @Size(max = 200) String name,
		@Size(max = 30) String phone,
		@Size(max = 255) String email,
		@Size(max = 20) String status
) {
}
