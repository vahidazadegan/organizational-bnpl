package com.organizational.bnpl.merchant.service;

import com.organizational.bnpl.admin.domain.Merchant;
import com.organizational.bnpl.merchant.config.JwtProperties;
import com.organizational.bnpl.merchant.util.JwtUtils;
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

	public String createAccessToken(Merchant merchant) {
		Instant now = Instant.now();
		Instant expiresAt = now.plusSeconds(jwtProperties.expirationSeconds());

		JwtClaimsSet claims = JwtClaimsSet.builder()
				.issuer(jwtProperties.issuer())
				.issuedAt(now)
				.expiresAt(expiresAt)
				.subject(merchant.getAccessId())
				.claim(JwtUtils.CLAIM_MERCHANT_ID, merchant.getId().toString())
				.claim(JwtUtils.CLAIM_ACCESS_ID, merchant.getAccessId())
				.build();

		JwsHeader header = JwsHeader.with(MacAlgorithm.HS256).build();
		return jwtEncoder.encode(JwtEncoderParameters.from(header, claims)).getTokenValue();
	}

	public long expirationSeconds() {
		return jwtProperties.expirationSeconds();
	}
}
