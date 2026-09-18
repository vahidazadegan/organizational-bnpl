package com.organizational.bnpl.panel.util;

import com.organizational.bnpl.panel.exception.BadRequestException;
import org.springframework.security.oauth2.jwt.Jwt;

import java.util.UUID;

/**
 * Helpers for reading panel-user claims from an access-token {@link Jwt}.
 */
public final class JwtUtils {

	public static final String CLAIM_USER_ID = "user_id";
	public static final String CLAIM_ORGANIZATION_ID = "organization_id";
	public static final String CLAIM_FIRST_NAME = "first_name";
	public static final String CLAIM_LAST_NAME = "last_name";

	private JwtUtils() {
	}

	public static UUID getUserId(Jwt jwt) {
		return requireUuidClaim(jwt, CLAIM_USER_ID);
	}

	public static UUID getOrganizationId(Jwt jwt) {
		return requireUuidClaim(jwt, CLAIM_ORGANIZATION_ID);
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
		return optionalStringClaim(jwt, CLAIM_FIRST_NAME);
	}

	public static String getLastName(Jwt jwt) {
		return optionalStringClaim(jwt, CLAIM_LAST_NAME);
	}

	private static UUID requireUuidClaim(Jwt jwt, String claimName) {
		requireJwt(jwt);
		String value = jwt.getClaimAsString(claimName);
		if (value == null || value.isBlank()) {
			throw new BadRequestException("مقدار " + claimName + " در توکن یافت نشد");
		}
		try {
			return UUID.fromString(value);
		} catch (IllegalArgumentException ex) {
			throw new BadRequestException("مقدار " + claimName + " در توکن نامعتبر است");
		}
	}

	private static String optionalStringClaim(Jwt jwt, String claimName) {
		requireJwt(jwt);
		String value = jwt.getClaimAsString(claimName);
		return value == null ? "" : value;
	}

	private static void requireJwt(Jwt jwt) {
		if (jwt == null) {
			throw new BadRequestException("توکن احراز هویت موجود نیست");
		}
	}
}
