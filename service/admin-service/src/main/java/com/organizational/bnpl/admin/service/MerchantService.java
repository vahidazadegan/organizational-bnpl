package com.organizational.bnpl.admin.service;

import com.organizational.bnpl.admin.domain.Merchant;
import com.organizational.bnpl.admin.dto.CreateMerchantRequest;
import com.organizational.bnpl.admin.dto.MerchantAccessKeyResponse;
import com.organizational.bnpl.admin.dto.MerchantCreatedResponse;
import com.organizational.bnpl.admin.dto.MerchantResponse;
import com.organizational.bnpl.admin.dto.UpdateMerchantRequest;
import com.organizational.bnpl.admin.dto.UpdateMerchantStatusRequest;
import com.organizational.bnpl.admin.exception.BadRequestException;
import com.organizational.bnpl.admin.exception.NotFoundException;
import com.organizational.bnpl.admin.mapper.MerchantMapper;
import com.organizational.bnpl.admin.repository.MerchantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.security.SecureRandom;
import java.util.Base64;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MerchantService {

	private static final String STATUS_ACTIVE = "ACTIVE";
	private static final String STATUS_INACTIVE = "INACTIVE";
	private static final String ACCESS_ID_PREFIX = "mrc_";

	private final MerchantRepository merchantRepository;
	private final MerchantMapper merchantMapper;
	private final PasswordEncoder passwordEncoder;
	private final SecureRandom secureRandom = new SecureRandom();

	@Transactional(readOnly = true)
	public List<MerchantResponse> listAll() {
		return merchantRepository.findAllByOrderByNameAsc().stream()
				.map(merchantMapper::toResponse)
				.toList();
	}

	@Transactional(readOnly = true)
	public MerchantResponse getById(UUID id) {
		return merchantMapper.toResponse(requireMerchant(id));
	}

	@Transactional
	public MerchantCreatedResponse create(CreateMerchantRequest request) {
		String accessId = generateAccessId();
		String accessKey = generateAccessKey();

		Merchant merchant = new Merchant();
		merchant.setName(request.name().trim());
		merchant.setPhone(blankToNull(request.phone()));
		merchant.setEmail(blankToNull(request.email()));
		merchant.setAccessId(accessId);
		merchant.setAccessKeyHash(passwordEncoder.encode(accessKey));
		merchant.setStatus(normalizeStatus(request.status()));

		Merchant saved = merchantRepository.saveAndFlush(merchant);
		return merchantMapper.toCreatedResponse(saved, accessKey);
	}

	@Transactional
	public MerchantResponse update(UUID id, UpdateMerchantRequest request) {
		Merchant merchant = requireMerchant(id);

		if (StringUtils.hasText(request.name())) {
			merchant.setName(request.name().trim());
		}
		if (request.phone() != null) {
			merchant.setPhone(blankToNull(request.phone()));
		}
		if (request.email() != null) {
			merchant.setEmail(blankToNull(request.email()));
		}

		Merchant saved = merchantRepository.saveAndFlush(merchant);
		return merchantMapper.toResponse(saved);
	}

	@Transactional
	public MerchantResponse updateStatus(UUID id, UpdateMerchantStatusRequest request) {
		Merchant merchant = requireMerchant(id);
		merchant.setStatus(requireStatus(request.status()));
		Merchant saved = merchantRepository.saveAndFlush(merchant);
		return merchantMapper.toResponse(saved);
	}

	@Transactional
	public MerchantAccessKeyResponse rotateAccessKey(UUID id) {
		Merchant merchant = requireMerchant(id);
		String accessKey = generateAccessKey();
		merchant.setAccessKeyHash(passwordEncoder.encode(accessKey));
		Merchant saved = merchantRepository.saveAndFlush(merchant);
		return new MerchantAccessKeyResponse(saved.getId(), saved.getAccessId(), accessKey);
	}

	private Merchant requireMerchant(UUID id) {
		return merchantRepository.findById(id)
				.orElseThrow(() -> new NotFoundException("پذیرنده یافت نشد"));
	}

	private String generateAccessId() {
		String candidate;
		do {
			candidate = ACCESS_ID_PREFIX + UUID.randomUUID().toString().replace("-", "");
		} while (merchantRepository.existsByAccessId(candidate));
		return candidate;
	}

	private String generateAccessKey() {
		byte[] bytes = new byte[32];
		secureRandom.nextBytes(bytes);
		return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
	}

	private static String requireStatus(String status) {
		if (!StringUtils.hasText(status)) {
			throw new BadRequestException("وضعیت الزامی است");
		}
		String normalized = status.trim().toUpperCase();
		if (!STATUS_ACTIVE.equals(normalized) && !STATUS_INACTIVE.equals(normalized)) {
			throw new BadRequestException("وضعیت باید ACTIVE یا INACTIVE باشد");
		}
		return normalized;
	}

	private static String normalizeStatus(String status) {
		if (!StringUtils.hasText(status)) {
			return STATUS_ACTIVE;
		}
		return requireStatus(status);
	}

	private static String blankToNull(String value) {
		if (!StringUtils.hasText(value)) {
			return null;
		}
		return value.trim();
	}
}
