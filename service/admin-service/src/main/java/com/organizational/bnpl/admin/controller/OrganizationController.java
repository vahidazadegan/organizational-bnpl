package com.organizational.bnpl.admin.controller;

import com.organizational.bnpl.admin.dto.CreateOrganizationRequest;
import com.organizational.bnpl.admin.dto.OrganizationSummaryResponse;
import com.organizational.bnpl.admin.dto.UpdateOrganizationStatusRequest;
import com.organizational.bnpl.admin.service.OrganizationService;
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
@RequestMapping("/organizations")
@RequiredArgsConstructor
public class OrganizationController {

	private final OrganizationService organizationService;

	@GetMapping
	@Operation(summary = "فهرست سازمان‌ها")
	public List<OrganizationSummaryResponse> list() {
		return organizationService.listAll();
	}

	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	@Operation(summary = "ایجاد سازمان جدید")
	public OrganizationSummaryResponse create(@Valid @RequestBody CreateOrganizationRequest request) {
		return organizationService.create(request);
	}

	@PatchMapping("/{id}/status")
	@Operation(summary = "تغییر وضعیت سازمان (فعال / غیرفعال)")
	public OrganizationSummaryResponse updateStatus(
			@PathVariable UUID id,
			@Valid @RequestBody UpdateOrganizationStatusRequest request) {
		return organizationService.updateStatus(id, request);
	}
}
