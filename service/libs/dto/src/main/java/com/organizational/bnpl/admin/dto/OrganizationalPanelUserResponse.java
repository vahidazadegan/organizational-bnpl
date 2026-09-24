package com.organizational.bnpl.admin.dto;

import java.time.Instant;
import java.util.UUID;

public record OrganizationalPanelUserResponse(
		UUID id,
		String username,
		String firstName,
		String lastName,
		String email,
		String phone,
		String status,
		UUID organizationId,
		String organizationCode,
		String organizationName,
		Instant lastLoginAt,
		Instant createdAt
) {
}
