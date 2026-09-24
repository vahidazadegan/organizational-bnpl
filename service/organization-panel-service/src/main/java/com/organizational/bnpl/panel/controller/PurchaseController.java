package com.organizational.bnpl.panel.controller;

import com.organizational.bnpl.panel.dto.InstallmentResponse;
import com.organizational.bnpl.panel.dto.PageResponse;
import com.organizational.bnpl.panel.dto.PurchaseSummaryResponse;
import com.organizational.bnpl.panel.service.PurchaseService;
import com.organizational.bnpl.panel.util.JwtUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/purchases")
@RequiredArgsConstructor
public class PurchaseController {

	private final PurchaseService purchaseService;

	@GetMapping
	@Operation(
			summary = "جست‌وجوی صفحه‌بندی‌شده خریدها",
			description = """
					خریدهای سازمان توکن را با فیلترهای اختیاری برمی‌گرداند:
					name (نام کاربر)، mobile، nationalId، status، orderNumber، shopName.
					صفحه‌بندی: page از ۱ (پیش‌فرض ۱)، size پیش‌فرض ۸ و حداکثر ۱۰۰.
					""")
	public PageResponse<PurchaseSummaryResponse> search(
			@Parameter(description = "نام یا نام خانوادگی کاربر")
			@RequestParam(required = false) String name,
			@Parameter(description = "موبایل کاربر (جست‌وجوی جزئی)")
			@RequestParam(required = false) String mobile,
			@Parameter(description = "کد ملی کاربر (جست‌وجوی جزئی)")
			@RequestParam(required = false) String nationalId,
			@Parameter(description = "وضعیت خرید")
			@RequestParam(required = false) String status,
			@Parameter(description = "شماره سفارش (جست‌وجوی جزئی)")
			@RequestParam(required = false) String orderNumber,
			@Parameter(description = "نام فروشگاه (جست‌وجوی جزئی)")
			@RequestParam(required = false) String shopName,
			@Parameter(description = "شماره صفحه (از ۱)")
			@RequestParam(required = false) Integer page,
			@Parameter(description = "اندازه صفحه (۱ تا ۱۰۰)")
			@RequestParam(required = false) Integer size,
			@Parameter(hidden = true) @AuthenticationPrincipal Jwt jwt) {
		return purchaseService.search(
				JwtUtils.getOrganizationId(jwt),
				name,
				mobile,
				nationalId,
				status,
				orderNumber,
				shopName,
				page,
				size);
	}

	@GetMapping("/{purchaseId}/installments")
	@Operation(
			summary = "اقساط صفحه‌بندی‌شده یک خرید",
			description = """
					اقساط متعلق به خرید مشخص را برمی‌گرداند.
					خرید باید متعلق به سازمان توکن باشد؛ در غیر این صورت 404.
					صفحه‌بندی: page از ۱ (پیش‌فرض ۱)، size پیش‌فرض ۸ و حداکثر ۱۰۰.
					مرتب‌سازی بر اساس شماره قسط صعودی.
					""")
	public PageResponse<InstallmentResponse> listInstallments(
			@Parameter(description = "شناسه خرید")
			@PathVariable UUID purchaseId,
			@Parameter(description = "شماره صفحه (از ۱)")
			@RequestParam(required = false) Integer page,
			@Parameter(description = "اندازه صفحه (۱ تا ۱۰۰)")
			@RequestParam(required = false) Integer size,
			@Parameter(hidden = true) @AuthenticationPrincipal Jwt jwt) {
		return purchaseService.listInstallments(
				purchaseId,
				JwtUtils.getOrganizationId(jwt),
				page,
				size);
	}
}
