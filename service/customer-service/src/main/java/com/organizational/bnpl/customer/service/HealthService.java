package com.organizational.bnpl.customer.service;

import com.organizational.bnpl.customer.dto.HealthResponse;
import org.springframework.stereotype.Service;

@Service
public class HealthService {

	public HealthResponse current() {
		return new HealthResponse("UP", "customer-service");
	}
}
