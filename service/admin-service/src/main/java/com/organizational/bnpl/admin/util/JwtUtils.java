package com.organizational.bnpl.admin.util;

import com.organizational.bnpl.admin.exception.BadRequestException;
import org.springframework.security.oauth2.jwt.Jwt;

import java.util.UUID;

public final class JwtUtils {

	public static final String CLAIM_USER_ID = "user_id";
	public static final String CLAIM_FIRST_NAME = "first_name";
	public static final String CLAIM_LAST_NAME = "last_name";

	private JwtUtils() {
	}

	public static UUID getUserId(Jwt jwt) {
		requireJwt(jwt);
		String value = jwt.getClaimAsString(CLAIM_USER_ID);
		if (value == null || value.isBlank()) {
			throw new BadRequestException("مقدار " + CLAIM_USER_ID + " در توکن یافت نشد");
		}
		try {
			return UUID.fromString(value);
		} catch (IllegalArgumentException ex) {
			throw new BadRequestException("مقدار " + CLAIM_USER_ID + " در توکن نامعتبر است");
		}
	}

	public static String getUsername(Jwt jwt) {
		requireJwt(jwt);
		String subject = jwt.getSubject();
		if (subject == null || subject.isBlank()) {
			throw new BadRequestException("شناسه کاربری در توکن یافت نشد");
		}
		return subject;
	}

	public static String getFirstName(Jwt jwt) {
		requireJwt(jwt);
		String value = jwt.getClaimAsString(CLAIM_FIRST_NAME);
		return value == null ? "" : value;
	}

	public static String getLastName(Jwt jwt) {
		requireJwt(jwt);
		String value = jwt.getClaimAsString(CLAIM_LAST_NAME);
		return value == null ? "" : value;
	}

	private static void requireJwt(Jwt jwt) {
		if (jwt == null) {
			throw new BadRequestException("توکن احراز هویت موجود نیست");
		}
	}
}
