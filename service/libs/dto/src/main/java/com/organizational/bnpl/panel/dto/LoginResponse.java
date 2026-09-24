package com.organizational.bnpl.panel.dto;

import java.util.UUID;

public record LoginResponse(
		String accessToken,
		String tokenType,
		long expiresIn,
		PanelUserResponse user
) {

	public record PanelUserResponse(
			UUID id,
			UUID organizationId,
			String username,
			String firstName,
			String lastName
	) {
	}
}
