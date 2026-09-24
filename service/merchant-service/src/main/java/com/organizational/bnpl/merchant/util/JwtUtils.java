package com.organizational.bnpl.merchant.util;

import org.springframework.security.oauth2.jwt.Jwt;

import java.util.UUID;

public final class JwtUtils {

	public static final String CLAIM_MERCHANT_ID = "merchantId";
	public static final String CLAIM_ACCESS_ID = "accessId";

	private JwtUtils() {
	}

	public static UUID getMerchantId(Jwt jwt) {
		String value = jwt.getClaimAsString(CLAIM_MERCHANT_ID);
		if (value == null || value.isBlank()) {
			throw new IllegalStateException("JWT missing merchantId claim");
		}
		return UUID.fromString(value);
	}
}
