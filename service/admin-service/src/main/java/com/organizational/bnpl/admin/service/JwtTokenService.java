package com.organizational.bnpl.admin.service;

import com.organizational.bnpl.admin.config.JwtProperties;
import com.organizational.bnpl.admin.security.AdminUserPrincipal;
import com.organizational.bnpl.admin.util.JwtUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class JwtTokenService {

	private final JwtEncoder jwtEncoder;
	private final JwtProperties jwtProperties;

	public String createAccessToken(AdminUserPrincipal principal) {
		Instant now = Instant.now();
		Instant expiresAt = now.plusSeconds(jwtProperties.expirationSeconds());

		JwtClaimsSet claims = JwtClaimsSet.builder()
				.issuer(jwtProperties.issuer())
				.issuedAt(now)
				.expiresAt(expiresAt)
				.subject(principal.getUsername())
				.claim(JwtUtils.CLAIM_USER_ID, principal.getId().toString())
				.claim(JwtUtils.CLAIM_FIRST_NAME, principal.getFirstName())
				.claim(JwtUtils.CLAIM_LAST_NAME, principal.getLastName())
				.build();

		JwsHeader header = JwsHeader.with(MacAlgorithm.HS256).build();
		return jwtEncoder.encode(JwtEncoderParameters.from(header, claims)).getTokenValue();
	}

	public long expirationSeconds() {
		return jwtProperties.expirationSeconds();
	}
}
