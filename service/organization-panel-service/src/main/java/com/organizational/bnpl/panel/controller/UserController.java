package com.organizational.bnpl.panel.controller;

import com.organizational.bnpl.panel.dto.PageResponse;
import com.organizational.bnpl.panel.dto.UserImportResponse;
import com.organizational.bnpl.panel.dto.UserResponse;
import com.organizational.bnpl.panel.service.UserImportService;
import com.organizational.bnpl.panel.service.UserService;
import com.organizational.bnpl.panel.util.JwtUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

	private final UserImportService userImportService;
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

	@PostMapping(value = "/import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	@Operation(
			summary = "ورود کاربران از فایل CSV",
			description = """
					ستون‌های الزامی: first_name, last_name, mobile, national_id
					ستون‌های اختیاری: birth_date شمسی (yyyyMMdd؛ در دیتابیس به میلادی ذخیره می‌شود)، status (پیش‌فرض ACTIVE)
					کاربران به سازمان کاربر پنل (organization_id در JWT) assign می‌شوند.
					""")
	public UserImportResponse importUsers(
			@Parameter(
					description = "فایل CSV کاربران",
					required = true,
					content = @Content(
							mediaType = MediaType.APPLICATION_OCTET_STREAM_VALUE,
							schema = @Schema(type = "string", format = "binary")))
			@RequestPart("file") MultipartFile file,
			@Parameter(hidden = true) @AuthenticationPrincipal Jwt jwt) {
		return userImportService.importFromCsv(file, JwtUtils.getOrganizationId(jwt));
	}
}
