package com.organizational.bnpl.admin.dto;

import jakarta.validation.constraints.Size;

public record UpdateMerchantRequest(
		@Size(max = 200) String name,
		@Size(max = 30) String phone,
		@Size(max = 255) String email
) {
}
