package com.organizational.bnpl.admin.controller;

import com.organizational.bnpl.admin.dto.HealthResponse;
import com.organizational.bnpl.admin.service.HealthService;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class HealthController {

	private final HealthService healthService;

	@GetMapping("/health")
	@SecurityRequirements
	public HealthResponse health() {
		return healthService.current();
	}
}
