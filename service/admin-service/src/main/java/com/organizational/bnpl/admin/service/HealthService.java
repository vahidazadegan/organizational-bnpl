package com.organizational.bnpl.admin.service;

import com.organizational.bnpl.admin.dto.HealthResponse;
import org.springframework.stereotype.Service;

@Service
public class HealthService {

	public HealthResponse current() {
		return new HealthResponse("UP", "admin-service");
	}
}
