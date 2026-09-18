package com.organizational.bnpl.panel.controller;

import com.organizational.bnpl.panel.dto.PageResponse;
import com.organizational.bnpl.panel.dto.UserResponse;
import com.organizational.bnpl.panel.service.UserService;
import com.organizational.bnpl.panel.util.JwtUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

	private final UserService userService;

	@GetMapping
	@Operation(
			summary = "جست‌وجوی صفحه‌بندی‌شده کاربران سازمان",
			description = """
					کاربران متعلق به سازمان توکن (organization_id در JWT) را برمی‌گرداند.
					فیلترهای اختیاری: name (نام یا نام خانوادگی)، mobile، nationalId، status (ACTIVE|INACTIVE).
					صفحه‌بندی: page از ۱ شروع می‌شود (پیش‌فرض ۱)، size پیش‌فرض ۸ و حداکثر ۱۰۰.
					""")
	public PageResponse<UserResponse> searchUsers(
			@Parameter(description = "نام یا نام خانوادگی")
			@RequestParam(required = false) String name,
			@Parameter(description = "موبایل (جست‌وجوی جزئی)")
			@RequestParam(required = false) String mobile,
			@Parameter(description = "کد ملی (جست‌وجوی جزئی)")
			@RequestParam(required = false) String nationalId,
			@Parameter(description = "وضعیت: ACTIVE یا INACTIVE")
			@RequestParam(required = false) String status,
			@Parameter(description = "شماره صفحه (از ۱)")
			@RequestParam(required = false) Integer page,
			@Parameter(description = "اندازه صفحه (۱ تا ۱۰۰)")
			@RequestParam(required = false) Integer size,
			@Parameter(hidden = true) @AuthenticationPrincipal Jwt jwt) {
		return userService.search(
				JwtUtils.getOrganizationId(jwt),
				name,
				mobile,
				nationalId,
				status,
				page,
				size);
	}
}
