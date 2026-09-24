package com.organizational.bnpl.merchant.service;

import com.organizational.bnpl.admin.domain.Merchant;
import com.organizational.bnpl.merchant.dto.MerchantTokenRequest;
import com.organizational.bnpl.merchant.dto.MerchantTokenResponse;
import com.organizational.bnpl.merchant.exception.UnauthorizedException;
import com.organizational.bnpl.merchant.repository.MerchantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class MerchantAuthService {

	private static final String STATUS_ACTIVE = "ACTIVE";

	private final MerchantRepository merchantRepository;
	private final PasswordEncoder passwordEncoder;
	private final JwtTokenService jwtTokenService;

	@Transactional(readOnly = true)
	public MerchantTokenResponse issueToken(MerchantTokenRequest request) {
		Merchant merchant = merchantRepository.findByAccessId(request.accessId().trim())
				.orElseThrow(() -> new UnauthorizedException("AccessID یا AccessKey نامعتبر است"));

		if (!STATUS_ACTIVE.equalsIgnoreCase(merchant.getStatus())) {
			throw new UnauthorizedException("پذیرنده غیرفعال است");
		}

		if (!passwordEncoder.matches(request.accessKey(), merchant.getAccessKeyHash())) {
			throw new UnauthorizedException("AccessID یا AccessKey نامعتبر است");
		}

		String token = jwtTokenService.createAccessToken(merchant);
		return new MerchantTokenResponse(token, "Bearer", jwtTokenService.expirationSeconds());
	}
}
