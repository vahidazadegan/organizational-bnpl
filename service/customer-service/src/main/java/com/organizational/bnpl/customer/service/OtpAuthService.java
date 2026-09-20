package com.organizational.bnpl.customer.service;

import com.organizational.bnpl.customer.config.OtpProperties;
import com.organizational.bnpl.customer.dto.LoginResponse;
import com.organizational.bnpl.customer.dto.OtpRequestResponse;
import com.organizational.bnpl.customer.exception.InvalidOtpException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class OtpAuthService {

	private final OtpProperties otpProperties;
	private final OtpStore otpStore;
	private final JwtTokenService jwtTokenService;
	private final SecureRandom secureRandom = new SecureRandom();

	public OtpRequestResponse requestOtp(String mobile) {
		String code = resolveCode();
		otpStore.put(mobile, code);
		// SMS gateway will replace this later; for now log for local/dev use.
		log.info("OTP for mobile {}: {}", mobile, code);
		return new OtpRequestResponse(mobile, otpProperties.ttlSeconds());
	}

	public LoginResponse verifyOtp(String mobile, String code) {
		if (!otpStore.consumeIfValid(mobile, code)) {
			throw new InvalidOtpException("کد تأیید نامعتبر یا منقضی شده است");
		}

		// Stable id derived from mobile until a real users table exists.
		UUID userId = UUID.nameUUIDFromBytes(("customer:" + mobile).getBytes());
		String accessToken = jwtTokenService.createAccessToken(userId, mobile);

		return new LoginResponse(
				accessToken,
				"Bearer",
				jwtTokenService.expirationSeconds(),
				new LoginResponse.CustomerUserResponse(userId, mobile));
	}

	private String resolveCode() {
		String fixed = otpProperties.fixedCode();
		if (fixed != null && !fixed.isBlank()) {
			return fixed.trim();
		}
		int length = Math.max(4, Math.min(8, otpProperties.length()));
		int bound = (int) Math.pow(10, length);
		int value = secureRandom.nextInt(bound / 10, bound);
		return String.valueOf(value);
	}
}
