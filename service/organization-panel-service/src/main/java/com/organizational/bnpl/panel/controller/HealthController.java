package com.organizational.bnpl.panel.controller;

import com.organizational.bnpl.panel.dto.HealthResponse;
import com.organizational.bnpl.panel.service.HealthService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class HealthController {

	private final HealthService healthService;

	public HealthController(HealthService healthService) {
		this.healthService = healthService;
	}

	@GetMapping("/health")
	public HealthResponse health() {
		return healthService.current();
	}
}
