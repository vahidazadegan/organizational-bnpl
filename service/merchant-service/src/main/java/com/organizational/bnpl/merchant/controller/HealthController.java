package com.organizational.bnpl.merchant.controller;

import com.organizational.bnpl.merchant.dto.HealthResponse;
import com.organizational.bnpl.merchant.service.HealthService;
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
		return healthService.health();
	}
}
