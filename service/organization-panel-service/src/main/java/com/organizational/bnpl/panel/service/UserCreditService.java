package com.organizational.bnpl.panel.service;

import com.organizational.bnpl.panel.domain.UserCredit;
import com.organizational.bnpl.panel.dto.UserCreditResponse;
import com.organizational.bnpl.panel.exception.NotFoundException;
import com.organizational.bnpl.panel.mapper.UserCreditMapper;
import com.organizational.bnpl.panel.repository.UserCreditRepository;
import com.organizational.bnpl.panel.repository.UserOrganizationRepository;
import com.organizational.bnpl.panel.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserCreditService {

	private final UserRepository userRepository;
	private final UserOrganizationRepository userOrganizationRepository;
	private final UserCreditRepository userCreditRepository;
	private final UserCreditMapper userCreditMapper;

	@Transactional(readOnly = true)
	public List<UserCreditResponse> listByUserId(UUID userId, UUID organizationId) {
		if (!userRepository.existsById(userId)) {
			throw new NotFoundException("کاربر یافت نشد");
		}
		if (!userOrganizationRepository.existsByUserIdAndOrganizationId(userId, organizationId)) {
			throw new NotFoundException("کاربر در این سازمان یافت نشد");
		}

		List<UserCredit> credits = userCreditRepository
				.findByUserIdAndOrganizationIdOrderByCreatedAtDesc(userId, organizationId);

		return credits.stream().map(userCreditMapper::toResponse).toList();
	}
}
