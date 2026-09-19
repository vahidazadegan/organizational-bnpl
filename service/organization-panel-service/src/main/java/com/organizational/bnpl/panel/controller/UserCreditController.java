package com.organizational.bnpl.panel.controller;

import com.organizational.bnpl.panel.dto.UserCreditResponse;
import com.organizational.bnpl.panel.service.UserCreditService;
import com.organizational.bnpl.panel.util.JwtUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/users/{userId}/credits")
@RequiredArgsConstructor
public class UserCreditController {

	private final UserCreditService userCreditService;

	@GetMapping
	@Operation(
			summary = "فهرست اعتبارهای یک کاربر",
			description = """
					اعتبارهای کاربر را برای سازمان توکن برمی‌گرداند.
					هر کاربر می‌تواند یک یا چند اعتبار داشته باشد.
					اگر کاربر وجود نداشته باشد یا به سازمان متعلق نباشد، 404 برمی‌گردد.
					""")
	public List<UserCreditResponse> listByUserId(
			@Parameter(description = "شناسه کاربر")
			@PathVariable UUID userId,
			@Parameter(hidden = true) @AuthenticationPrincipal Jwt jwt) {
		return userCreditService.listByUserId(userId, JwtUtils.getOrganizationId(jwt));
	}
}
