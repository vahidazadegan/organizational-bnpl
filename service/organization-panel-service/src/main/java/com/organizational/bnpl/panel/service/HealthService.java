package com.organizational.bnpl.panel.service;

import com.organizational.bnpl.panel.dto.HealthResponse;
import org.springframework.stereotype.Service;

@Service
public class HealthService {

	public HealthResponse current() {
		return new HealthResponse("UP", "organization-panel-service");
	}
}
