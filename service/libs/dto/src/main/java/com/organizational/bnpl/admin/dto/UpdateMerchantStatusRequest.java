package com.organizational.bnpl.admin.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateMerchantStatusRequest(
		@NotBlank @Size(max = 20) String status
) {
}
