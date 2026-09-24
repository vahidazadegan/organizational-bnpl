package com.organizational.bnpl.merchant.service;

import com.organizational.bnpl.merchant.dto.HealthResponse;
import org.springframework.stereotype.Service;

@Service
public class HealthService {

	public HealthResponse health() {
		return new HealthResponse("UP", "merchant-service");
	}
}
