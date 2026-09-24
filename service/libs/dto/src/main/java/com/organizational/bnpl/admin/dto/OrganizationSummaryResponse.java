package com.organizational.bnpl.admin.dto;

import java.util.UUID;

public record OrganizationSummaryResponse(
		UUID id,
		String code,
		String name,
		String nationalId,
		String status,
		String email,
		String phone
) {
}
