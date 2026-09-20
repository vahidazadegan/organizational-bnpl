package com.organizational.bnpl.customer.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.otp")
public record OtpProperties(
		long ttlSeconds,
		int length,
		String fixedCode
) {
}
