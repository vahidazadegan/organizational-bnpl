package com.organizational.bnpl.customer.dto;

public record OtpRequestResponse(
		String mobile,
		long expiresInSeconds
) {
}
