package com.organizational.bnpl.customer.dto;

import java.util.UUID;

public record LoginResponse(
		String accessToken,
		String tokenType,
		long expiresIn,
		CustomerUserResponse user
) {

	public record CustomerUserResponse(
			UUID id,
			String mobile
	) {
	}
}
