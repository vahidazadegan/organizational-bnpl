package com.organizational.bnpl.panel.service;

import com.organizational.bnpl.panel.dto.LoginRequest;
import com.organizational.bnpl.panel.dto.LoginResponse;
import com.organizational.bnpl.panel.repository.PanelUserRepository;
import com.organizational.bnpl.panel.security.PanelUserPrincipal;
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
	private final PanelUserRepository panelUserRepository;

	@Transactional
	public LoginResponse login(LoginRequest request) {
		Authentication authentication = authenticationManager.authenticate(
				new UsernamePasswordAuthenticationToken(request.username(), request.password()));

		PanelUserPrincipal principal = (PanelUserPrincipal) authentication.getPrincipal();

		panelUserRepository.findById(principal.getId()).ifPresent(user -> user.setLastLoginAt(Instant.now()));

		String accessToken = jwtTokenService.createAccessToken(principal);

		return new LoginResponse(
				accessToken,
				"Bearer",
				jwtTokenService.expirationSeconds(),
				new LoginResponse.PanelUserResponse(
						principal.getId(),
						principal.getOrganizationId(),
						principal.getUsername(),
						principal.getFirstName(),
						principal.getLastName()));
	}
}
