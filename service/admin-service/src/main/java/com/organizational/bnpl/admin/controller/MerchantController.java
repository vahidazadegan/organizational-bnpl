package com.organizational.bnpl.admin.controller;

import com.organizational.bnpl.admin.dto.CreateMerchantRequest;
import com.organizational.bnpl.admin.dto.MerchantAccessKeyResponse;
import com.organizational.bnpl.admin.dto.MerchantCreatedResponse;
import com.organizational.bnpl.admin.dto.MerchantResponse;
import com.organizational.bnpl.admin.dto.UpdateMerchantRequest;
import com.organizational.bnpl.admin.dto.UpdateMerchantStatusRequest;
import com.organizational.bnpl.admin.service.MerchantService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/merchants")
@RequiredArgsConstructor
public class MerchantController {

	private final MerchantService merchantService;

	@GetMapping
	@Operation(summary = "فهرست پذیرندگان")
	public List<MerchantResponse> list() {
		return merchantService.listAll();
	}

	@GetMapping("/{id}")
	@Operation(summary = "جزئیات پذیرنده")
	public MerchantResponse get(@PathVariable UUID id) {
		return merchantService.getById(id);
	}

	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	@Operation(summary = "ایجاد پذیرنده؛ AccessKey فقط یک‌بار در پاسخ برمی‌گردد")
	public MerchantCreatedResponse create(@Valid @RequestBody CreateMerchantRequest request) {
		return merchantService.create(request);
	}

	@PatchMapping("/{id}")
	@Operation(summary = "ویرایش نام/تلفن/ایمیل پذیرنده")
	public MerchantResponse update(
			@PathVariable UUID id,
			@Valid @RequestBody UpdateMerchantRequest request) {
		return merchantService.update(id, request);
	}

	@PatchMapping("/{id}/status")
	@Operation(summary = "تغییر وضعیت پذیرنده (فعال / غیرفعال)")
	public MerchantResponse updateStatus(
			@PathVariable UUID id,
			@Valid @RequestBody UpdateMerchantStatusRequest request) {
		return merchantService.updateStatus(id, request);
	}

	@PostMapping("/{id}/rotate-access-key")
	@Operation(summary = "چرخش AccessKey؛ کلید جدید فقط یک‌بار نمایش داده می‌شود")
	public MerchantAccessKeyResponse rotateAccessKey(@PathVariable UUID id) {
		return merchantService.rotateAccessKey(id);
	}
}
