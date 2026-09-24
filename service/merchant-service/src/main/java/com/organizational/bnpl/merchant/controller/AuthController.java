package com.organizational.bnpl.merchant.controller;

import com.organizational.bnpl.merchant.dto.MerchantTokenRequest;
import com.organizational.bnpl.merchant.dto.MerchantTokenResponse;
import com.organizational.bnpl.merchant.service.MerchantAuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

	private final MerchantAuthService merchantAuthService;

	@PostMapping("/token")
	@SecurityRequirements
	@Operation(summary = "دریافت JWT با AccessID و AccessKey")
	public MerchantTokenResponse token(@Valid @RequestBody MerchantTokenRequest request) {
		return merchantAuthService.issueToken(request);
	}
}
