package com.organizational.bnpl.admin.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.security.jwt")
public record JwtProperties(
		String secret,
		String issuer,
		long expirationSeconds
) {
}
