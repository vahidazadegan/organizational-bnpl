package com.organizational.bnpl.admin.dto;

import java.util.UUID;

public record LoginResponse(
		String accessToken,
		String tokenType,
		long expiresIn,
		AdminUserResponse user
) {

	public record AdminUserResponse(
			UUID id,
			String username,
			String firstName,
			String lastName
	) {
	}
}
