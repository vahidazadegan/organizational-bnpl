package com.organizational.bnpl.panel.service;

import com.organizational.bnpl.panel.config.JwtProperties;
import com.organizational.bnpl.panel.security.PanelUserPrincipal;
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

	public String createAccessToken(PanelUserPrincipal principal) {
		Instant now = Instant.now();
		Instant expiresAt = now.plusSeconds(jwtProperties.expirationSeconds());

		JwtClaimsSet claims = JwtClaimsSet.builder()
				.issuer(jwtProperties.issuer())
				.issuedAt(now)
				.expiresAt(expiresAt)
				.subject(principal.getUsername())
				.claim("user_id", principal.getId().toString())
				.claim("organization_id", principal.getOrganizationId().toString())
				.claim("first_name", principal.getFirstName())
				.claim("last_name", principal.getLastName())
				.build();

		JwsHeader header = JwsHeader.with(MacAlgorithm.HS256).build();
		return jwtEncoder.encode(JwtEncoderParameters.from(header, claims)).getTokenValue();
	}

	public long expirationSeconds() {
		return jwtProperties.expirationSeconds();
	}
}
