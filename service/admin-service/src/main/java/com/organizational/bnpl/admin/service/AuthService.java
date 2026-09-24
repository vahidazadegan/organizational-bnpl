package com.organizational.bnpl.admin.service;

import com.organizational.bnpl.admin.dto.LoginRequest;
import com.organizational.bnpl.admin.dto.LoginResponse;
import com.organizational.bnpl.admin.repository.AdminUserRepository;
import com.organizational.bnpl.admin.security.AdminUserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class AuthService {

	private final AuthenticationManager authenticationManager;
	private final JwtTokenService jwtTokenService;
	private final AdminUserRepository adminUserRepository;

	@Transactional
	public LoginResponse login(LoginRequest request) {
		Authentication authentication = authenticationManager.authenticate(
				new UsernamePasswordAuthenticationToken(request.username(), request.password()));

		AdminUserPrincipal principal = (AdminUserPrincipal) authentication.getPrincipal();

		adminUserRepository.findById(principal.getId()).ifPresent(user -> user.setLastLoginAt(Instant.now()));

		String accessToken = jwtTokenService.createAccessToken(principal);

		return new LoginResponse(
				accessToken,
				"Bearer",
				jwtTokenService.expirationSeconds(),
				new LoginResponse.AdminUserResponse(
						principal.getId(),
						principal.getUsername(),
						principal.getFirstName(),
						principal.getLastName()));
	}
}
