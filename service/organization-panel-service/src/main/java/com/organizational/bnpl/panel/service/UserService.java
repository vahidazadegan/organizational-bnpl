package com.organizational.bnpl.panel.service;

import com.organizational.bnpl.panel.domain.User;
import com.organizational.bnpl.panel.dto.PageResponse;
import com.organizational.bnpl.panel.dto.UserResponse;
import com.organizational.bnpl.panel.exception.BadRequestException;
import com.organizational.bnpl.panel.mapper.UserMapper;
import com.organizational.bnpl.panel.repository.UserRepository;
import com.organizational.bnpl.panel.repository.specification.UserSpecifications;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

	private static final int DEFAULT_PAGE = 1;
	private static final int DEFAULT_SIZE = 8;
	private static final int MAX_SIZE = 100;
	private static final Set<String> ALLOWED_STATUSES = Set.of("ACTIVE", "INACTIVE");

	private final UserRepository userRepository;
	private final UserMapper userMapper;

	@Transactional(readOnly = true)
	public PageResponse<UserResponse> search(
			UUID organizationId,
			String name,
			String mobile,
			String nationalId,
			String status,
			Integer page,
			Integer size) {
		int pageNumber = normalizePage(page);
		int pageSize = normalizeSize(size);
		String normalizedStatus = normalizeStatus(status);

		PageRequest pageable = PageRequest.of(
				pageNumber - 1,
				pageSize,
				Sort.by(Sort.Direction.DESC, "createdAt"));

		Page<User> result = userRepository.findAll(
				UserSpecifications.withFilters(
						organizationId,
						blankToNull(name),
						blankToNull(mobile),
						blankToNull(nationalId),
						normalizedStatus),
				pageable);

		return PageResponse.map(result, pageNumber, userMapper::toResponse);
	}

	private int normalizePage(Integer page) {
		if (page == null) {
			return DEFAULT_PAGE;
		}
		if (page < 1) {
			throw new BadRequestException("شماره صفحه باید از ۱ شروع شود");
		}
		return page;
	}

	private int normalizeSize(Integer size) {
		if (size == null) {
			return DEFAULT_SIZE;
		}
		if (size < 1 || size > MAX_SIZE) {
			throw new BadRequestException("اندازه صفحه باید بین ۱ تا " + MAX_SIZE + " باشد");
		}
		return size;
	}

	private String normalizeStatus(String status) {
		String value = blankToNull(status);
		if (value == null) {
			return null;
		}
		String normalized = value.trim().toUpperCase(Locale.ROOT);
		if (!ALLOWED_STATUSES.contains(normalized)) {
			throw new BadRequestException("وضعیت نامعتبر است؛ مقادیر مجاز: ACTIVE، INACTIVE");
		}
		return normalized;
	}

	private String blankToNull(String value) {
		if (value == null) {
			return null;
		}
		String trimmed = value.trim();
		return trimmed.isEmpty() ? null : trimmed;
	}
}
