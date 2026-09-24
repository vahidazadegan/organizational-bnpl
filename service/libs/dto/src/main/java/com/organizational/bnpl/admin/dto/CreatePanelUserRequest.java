package com.organizational.bnpl.admin.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record CreatePanelUserRequest(
		@NotNull UUID organizationId,
		@NotBlank @Size(max = 100) String username,
		@NotBlank @Size(min = 8, max = 100) String password,
		@NotBlank @Size(max = 100) String firstName,
		@NotBlank @Size(max = 100) String lastName,
		@Size(max = 255) String email,
		@Size(max = 30) String phone,
		@Size(max = 20) String status
) {
}
