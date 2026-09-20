package com.organizational.bnpl.customer.controller;

import com.organizational.bnpl.customer.dto.LoginResponse;
import com.organizational.bnpl.customer.dto.OtpRequestRequest;
import com.organizational.bnpl.customer.dto.OtpRequestResponse;
import com.organizational.bnpl.customer.dto.OtpVerifyRequest;
import com.organizational.bnpl.customer.service.OtpAuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth/otp")
@RequiredArgsConstructor
public class AuthController {

	private final OtpAuthService otpAuthService;

	@PostMapping("/request")
	@ResponseStatus(HttpStatus.OK)
	public OtpRequestResponse request(@Valid @RequestBody OtpRequestRequest request) {
		return otpAuthService.requestOtp(request.mobile());
	}

	@PostMapping("/verify")
	@ResponseStatus(HttpStatus.OK)
	public LoginResponse verify(@Valid @RequestBody OtpVerifyRequest request) {
		return otpAuthService.verifyOtp(request.mobile(), request.code());
	}
}
