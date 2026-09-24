package com.organizational.bnpl.admin.service;

import com.organizational.bnpl.admin.dto.CreatePanelUserRequest;
import com.organizational.bnpl.admin.dto.OrganizationalPanelUserResponse;
import com.organizational.bnpl.admin.dto.PageResponse;
import com.organizational.bnpl.admin.dto.UpdatePanelUserStatusRequest;
import com.organizational.bnpl.admin.exception.BadRequestException;
import com.organizational.bnpl.admin.exception.ConflictException;
import com.organizational.bnpl.admin.exception.NotFoundException;
import com.organizational.bnpl.admin.mapper.PanelUserMapper;
import com.organizational.bnpl.admin.repository.OrganizationRepository;
import com.organizational.bnpl.admin.repository.PanelUserRepository;
import com.organizational.bnpl.admin.repository.specification.PanelUserSpecifications;
import com.organizational.bnpl.panel.domain.identity.Organization;
import com.organizational.bnpl.panel.domain.identity.PanelUser;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PanelUserService {

	private static final int DEFAULT_PAGE = 1;
	private static final int DEFAULT_SIZE = 8;
	private static final int MAX_SIZE = 100;
	private static final String STATUS_ACTIVE = "ACTIVE";
	private static final String STATUS_INACTIVE = "INACTIVE";

	private final PanelUserRepository panelUserRepository;
	private final OrganizationRepository organizationRepository;
	private final PanelUserMapper panelUserMapper;
	private final PasswordEncoder passwordEncoder;

	@Transactional(readOnly = true)
	public PageResponse<OrganizationalPanelUserResponse> search(
			String username,
			String name,
			String status,
			String organization,
			Integer page,
			Integer size) {
		int pageNumber = normalizePage(page);
		int pageSize = normalizeSize(size);

		PageRequest pageable = PageRequest.of(
				pageNumber - 1,
				pageSize,
				Sort.by(Sort.Direction.DESC, "createdAt"));

		Page<PanelUser> result = panelUserRepository.findAll(
				PanelUserSpecifications.withFilters(username, name, status, organization),
				pageable);

		return PageResponse.map(result, pageNumber, panelUserMapper::toResponse);
	}

	@Transactional
	public OrganizationalPanelUserResponse create(CreatePanelUserRequest request) {
		String username = request.username().trim();
		if (panelUserRepository.existsByUsernameIgnoreCase(username)) {
			throw new ConflictException("نام کاربری از قبل ثبت شده است");
		}

		Organization organization = organizationRepository.findById(request.organizationId())
				.orElseThrow(() -> new NotFoundException("سازمان یافت نشد"));

		if (!STATUS_ACTIVE.equalsIgnoreCase(organization.getStatus())) {
			throw new BadRequestException("فقط برای سازمان فعال می‌توان کاربر ایجاد کرد");
		}

		String status = normalizeStatus(request.status());

		PanelUser user = new PanelUser();
		user.setOrganization(organization);
		user.setUsername(username);
		user.setPasswordHash(passwordEncoder.encode(request.password()));
		user.setFirstName(request.firstName().trim());
		user.setLastName(request.lastName().trim());
		user.setEmail(blankToNull(request.email()));
		user.setPhone(blankToNull(request.phone()));
		user.setStatus(status);

		PanelUser saved = panelUserRepository.saveAndFlush(user);
		return panelUserMapper.toResponse(saved);
	}

	@Transactional
	public OrganizationalPanelUserResponse updateStatus(UUID id, UpdatePanelUserStatusRequest request) {
		PanelUser user = panelUserRepository.findById(id)
				.orElseThrow(() -> new NotFoundException("کاربر سازمانی یافت نشد"));

		String status = requireStatus(request.status());
		user.setStatus(status);

		PanelUser saved = panelUserRepository.saveAndFlush(user);
		return panelUserMapper.toResponse(saved);
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

	private static int normalizePage(Integer page) {
		if (page == null || page < 1) {
			return DEFAULT_PAGE;
		}
		return page;
	}

	private static int normalizeSize(Integer size) {
		if (size == null || size < 1) {
			return DEFAULT_SIZE;
		}
		return Math.min(size, MAX_SIZE);
	}
}
