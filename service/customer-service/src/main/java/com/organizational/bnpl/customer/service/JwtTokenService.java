package com.organizational.bnpl.customer.service;

import com.organizational.bnpl.customer.config.JwtProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class JwtTokenService {

	public static final String CLAIM_USER_ID = "uid";
	public static final String CLAIM_MOBILE = "mobile";

	private final JwtEncoder jwtEncoder;
	private final JwtProperties jwtProperties;

	public String createAccessToken(UUID userId, String mobile) {
		Instant now = Instant.now();
		Instant expiresAt = now.plusSeconds(jwtProperties.expirationSeconds());

		JwtClaimsSet claims = JwtClaimsSet.builder()
				.issuer(jwtProperties.issuer())
				.issuedAt(now)
				.expiresAt(expiresAt)
				.subject(mobile)
				.claim(CLAIM_USER_ID, userId.toString())
				.claim(CLAIM_MOBILE, mobile)
				.build();

		JwsHeader header = JwsHeader.with(MacAlgorithm.HS256).build();
		return jwtEncoder.encode(JwtEncoderParameters.from(header, claims)).getTokenValue();
	}

	public long expirationSeconds() {
		return jwtProperties.expirationSeconds();
	}
}
