package com.organizational.bnpl.merchant.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.otp")
public record OtpProperties(
		long ttlSeconds,
		int length,
		int maxAttempts,
		String fixedCode
) {
}
