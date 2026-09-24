package com.organizational.bnpl.admin.dto;

import java.time.Instant;
import java.util.UUID;

public record MerchantResponse(
		UUID id,
		String name,
		String phone,
		String email,
		String accessId,
		String status,
		Instant createdAt,
		Instant updatedAt
) {
}
