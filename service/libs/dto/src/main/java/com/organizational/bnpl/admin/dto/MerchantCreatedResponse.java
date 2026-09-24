package com.organizational.bnpl.admin.dto;

import java.time.Instant;
import java.util.UUID;

public record MerchantCreatedResponse(
		UUID id,
		String name,
		String phone,
		String email,
		String accessId,
		String accessKey,
		String status,
		Instant createdAt,
		Instant updatedAt
) {
}
