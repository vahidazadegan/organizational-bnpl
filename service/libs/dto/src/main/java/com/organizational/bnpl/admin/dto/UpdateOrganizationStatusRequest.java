package com.organizational.bnpl.admin.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateOrganizationStatusRequest(
		@NotBlank @Size(max = 20) String status
) {
}
