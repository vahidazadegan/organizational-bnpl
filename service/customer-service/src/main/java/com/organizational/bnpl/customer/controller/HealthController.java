package com.organizational.bnpl.customer.controller;

import com.organizational.bnpl.customer.dto.HealthResponse;
import com.organizational.bnpl.customer.service.HealthService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class HealthController {

	private final HealthService healthService;

	@GetMapping("/health")
	public HealthResponse health() {
		return healthService.current();
	}
}
