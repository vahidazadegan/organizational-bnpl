package com.organizational.bnpl.admin.controller;

import com.organizational.bnpl.admin.dto.CreatePanelUserRequest;
import com.organizational.bnpl.admin.dto.OrganizationalPanelUserResponse;
import com.organizational.bnpl.admin.dto.PageResponse;
import com.organizational.bnpl.admin.dto.UpdatePanelUserStatusRequest;
import com.organizational.bnpl.admin.service.PanelUserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/panel-users")
@RequiredArgsConstructor
public class PanelUserController {

	private final PanelUserService panelUserService;

	@GetMapping
	@Operation(
			summary = "جست‌وجوی صفحه‌بندی‌شده کاربران سازمانی (PanelUser)",
			description = """
					فهرست کاربران پنل سازمانی را برمی‌گرداند.
					فیلترهای اختیاری: username، name (نام یا نام خانوادگی)، status، organization (نام یا کد سازمان).
					صفحه‌بندی: page از ۱ (پیش‌فرض ۱)، size پیش‌فرض ۸ و حداکثر ۱۰۰.
					""")
	public PageResponse<OrganizationalPanelUserResponse> search(
			@Parameter(description = "نام کاربری")
			@RequestParam(required = false) String username,
			@Parameter(description = "نام یا نام خانوادگی")
			@RequestParam(required = false) String name,
			@Parameter(description = "وضعیت: ACTIVE یا INACTIVE")
			@RequestParam(required = false) String status,
			@Parameter(description = "نام یا کد سازمان")
			@RequestParam(required = false) String organization,
			@Parameter(description = "شماره صفحه (از ۱)")
			@RequestParam(required = false) Integer page,
			@Parameter(description = "اندازه صفحه (۱ تا ۱۰۰)")
			@RequestParam(required = false) Integer size) {
		return panelUserService.search(username, name, status, organization, page, size);
	}

	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	@Operation(summary = "ایجاد کاربر پنل سازمانی جدید")
	public OrganizationalPanelUserResponse create(@Valid @RequestBody CreatePanelUserRequest request) {
		return panelUserService.create(request);
	}

	@PatchMapping("/{id}/status")
	@Operation(summary = "تغییر وضعیت کاربر سازمانی (فعال / غیرفعال)")
	public OrganizationalPanelUserResponse updateStatus(
			@PathVariable UUID id,
			@Valid @RequestBody UpdatePanelUserStatusRequest request) {
		return panelUserService.updateStatus(id, request);
	}
}
