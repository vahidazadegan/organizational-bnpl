package com.organizational.bnpl.merchant.controller;

import com.organizational.bnpl.merchant.dto.ConfirmPurchaseRequest;
import com.organizational.bnpl.merchant.dto.InitiatePurchaseRequest;
import com.organizational.bnpl.merchant.dto.InitiatePurchaseResponse;
import com.organizational.bnpl.merchant.service.MerchantPurchaseService;
import com.organizational.bnpl.merchant.util.JwtUtils;
import com.organizational.bnpl.panel.dto.PurchaseResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/purchases")
@RequiredArgsConstructor
public class PurchaseController {

	private final MerchantPurchaseService merchantPurchaseService;

	@PostMapping("/initiate")
	@ResponseStatus(HttpStatus.CREATED)
	@Operation(summary = "آغاز خرید PENDING و ارسال OTP")
	public InitiatePurchaseResponse initiate(
			@Valid @RequestBody InitiatePurchaseRequest request,
			@Parameter(hidden = true) @AuthenticationPrincipal Jwt jwt) {
		return merchantPurchaseService.initiate(JwtUtils.getMerchantId(jwt), request);
	}

	@PostMapping("/{purchaseId}/confirm")
	@Operation(summary = "تأیید خرید با OTP و تکمیل اقساط")
	public PurchaseResponse confirm(
			@PathVariable UUID purchaseId,
			@Valid @RequestBody ConfirmPurchaseRequest request,
			@Parameter(hidden = true) @AuthenticationPrincipal Jwt jwt) {
		return merchantPurchaseService.confirm(JwtUtils.getMerchantId(jwt), purchaseId, request);
	}
}
