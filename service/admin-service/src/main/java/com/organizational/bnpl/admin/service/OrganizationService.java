package com.organizational.bnpl.admin.service;

import com.organizational.bnpl.admin.dto.CreateOrganizationRequest;
import com.organizational.bnpl.admin.dto.OrganizationSummaryResponse;
import com.organizational.bnpl.admin.dto.UpdateOrganizationStatusRequest;
import com.organizational.bnpl.admin.exception.BadRequestException;
import com.organizational.bnpl.admin.exception.ConflictException;
import com.organizational.bnpl.admin.exception.NotFoundException;
import com.organizational.bnpl.admin.mapper.OrganizationMapper;
import com.organizational.bnpl.admin.repository.OrganizationRepository;
import com.organizational.bnpl.panel.domain.identity.Organization;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OrganizationService {

	private static final String STATUS_ACTIVE = "ACTIVE";
	private static final String STATUS_INACTIVE = "INACTIVE";

	private final OrganizationRepository organizationRepository;
	private final OrganizationMapper organizationMapper;

	@Transactional(readOnly = true)
	public List<OrganizationSummaryResponse> listAll() {
		return organizationRepository.findAllByOrderByNameAsc().stream()
				.map(organizationMapper::toSummary)
				.toList();
	}

	@Transactional
	public OrganizationSummaryResponse create(CreateOrganizationRequest request) {
		String code = request.code().trim();
		if (organizationRepository.existsByCodeIgnoreCase(code)) {
			throw new ConflictException("کد سازمان از قبل ثبت شده است");
		}

		String nationalId = blankToNull(request.nationalId());
		if (nationalId != null && organizationRepository.existsByNationalId(nationalId)) {
			throw new ConflictException("شناسه ملی سازمان از قبل ثبت شده است");
		}

		Organization organization = new Organization();
		organization.setCode(code);
		organization.setName(request.name().trim());
		organization.setNationalId(nationalId);
		organization.setEmail(blankToNull(request.email()));
		organization.setPhone(blankToNull(request.phone()));
		organization.setStatus(normalizeStatus(request.status()));

		Organization saved = organizationRepository.saveAndFlush(organization);
		return organizationMapper.toSummary(saved);
	}

	@Transactional
	public OrganizationSummaryResponse updateStatus(UUID id, UpdateOrganizationStatusRequest request) {
		Organization organization = organizationRepository.findById(id)
				.orElseThrow(() -> new NotFoundException("سازمان یافت نشد"));

		organization.setStatus(requireStatus(request.status()));
		Organization saved = organizationRepository.saveAndFlush(organization);
		return organizationMapper.toSummary(saved);
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
