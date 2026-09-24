package com.organizational.bnpl.admin.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdatePanelUserStatusRequest(
		@NotBlank @Size(max = 20) String status
) {
}
