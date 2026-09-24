package com.organizational.bnpl.merchant.dto;

public record MerchantTokenResponse(
		String accessToken,
		String tokenType,
		long expiresIn
) {
}
