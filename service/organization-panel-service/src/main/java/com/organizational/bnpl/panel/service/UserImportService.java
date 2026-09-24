package com.organizational.bnpl.panel.service;

import com.organizational.bnpl.panel.domain.identity.Organization;
import com.organizational.bnpl.panel.domain.User;
import com.organizational.bnpl.panel.domain.UserOrganization;
import com.organizational.bnpl.panel.dto.UserImportResponse;
import com.organizational.bnpl.panel.exception.BadRequestException;
import com.organizational.bnpl.panel.repository.OrganizationRepository;
import com.organizational.bnpl.panel.repository.UserOrganizationRepository;
import com.organizational.bnpl.panel.repository.UserRepository;
import com.organizational.bnpl.panel.util.JalaliDateUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserImportService {

	private static final String DEFAULT_STATUS = "ACTIVE";
	private static final List<String> REQUIRED_HEADERS = List.of(
			"first_name", "last_name", "mobile", "national_id");

	private final UserRepository userRepository;
	private final UserOrganizationRepository userOrganizationRepository;
	private final OrganizationRepository organizationRepository;

	@Transactional
	public UserImportResponse importFromCsv(MultipartFile file, UUID organizationId) {
		validateFile(file);

		Organization organization = organizationRepository.findById(organizationId)
				.orElseThrow(() -> new BadRequestException("سازمان معتبر یافت نشد"));

		try (BufferedReader reader = new BufferedReader(
				new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {

			String headerLine = reader.readLine();
			if (headerLine == null || headerLine.isBlank()) {
				throw new BadRequestException("فایل CSV خالی است");
			}

			headerLine = stripBom(headerLine);
			Map<String, Integer> headerIndex = parseHeader(headerLine);

			List<UserOrganization> membershipsToSave = new ArrayList<>();
			List<UserImportResponse.RowError> errors = new ArrayList<>();
			Set<String> batchNationalIds = new HashSet<>();
			Set<String> batchMobiles = new HashSet<>();
			int totalRows = 0;
			int imported = 0;
			int skipped = 0;
			int rowNumber = 1;

			String line;
			while ((line = reader.readLine()) != null) {
				rowNumber++;
				if (line.isBlank()) {
					continue;
				}
				totalRows++;

				try {
					String[] columns = splitCsvLine(line);
					User mapped = mapRow(columns, headerIndex);

					if (!batchNationalIds.add(mapped.getNationalId())
							|| !batchMobiles.add(mapped.getMobile())) {
						skipped++;
						errors.add(new UserImportResponse.RowError(
								rowNumber, "ردیف تکراری در همین فایل"));
						continue;
					}

					User user = resolveUser(mapped);
					if (userOrganizationRepository.existsByUserIdAndOrganizationId(
							user.getId(), organization.getId())) {
						skipped++;
						errors.add(new UserImportResponse.RowError(
								rowNumber, "کاربر قبلا در این سازمان ثبت شده است"));
						continue;
					}

					UserOrganization membership = new UserOrganization();
					membership.setUser(user);
					membership.setOrganization(organization);
					membership.setStatus(DEFAULT_STATUS);
					membershipsToSave.add(membership);
					imported++;
				} catch (BadRequestException ex) {
					skipped++;
					errors.add(new UserImportResponse.RowError(rowNumber, ex.getMessage()));
				}
			}

			if (!membershipsToSave.isEmpty()) {
				userOrganizationRepository.saveAll(membershipsToSave);
			}

			log.info(
					"CSV user import finished: org={}, total={}, imported={}, skipped={}",
					organization.getId(),
					totalRows,
					imported,
					skipped);

			return new UserImportResponse(totalRows, imported, skipped, errors);
		} catch (BadRequestException ex) {
			throw ex;
		} catch (Exception ex) {
			log.error("Failed to import users from CSV", ex);
			throw new BadRequestException("خواندن فایل CSV با خطا مواجه شد");
		}
	}

	/**
	 * Returns an existing user (by national id / mobile) or persists a new one.
	 */
	private User resolveUser(User mapped) {
		var byNationalId = userRepository.findByNationalId(mapped.getNationalId());
		var byMobile = userRepository.findByMobile(mapped.getMobile());

		if (byNationalId.isPresent() && byMobile.isPresent()
				&& !byNationalId.get().getId().equals(byMobile.get().getId())) {
			throw new BadRequestException("کد ملی و موبایل به دو کاربر متفاوت تعلق دارند");
		}

		if (byNationalId.isPresent()) {
			return byNationalId.get();
		}

		if (byMobile.isPresent()) {
			User existing = byMobile.get();
			if (!existing.getNationalId().equals(mapped.getNationalId())) {
				throw new BadRequestException(
						"شماره موبایل متعلق به کاربر دیگری است: " + mapped.getMobile());
			}
			return existing;
		}

		return userRepository.save(mapped);
	}

	private void validateFile(MultipartFile file) {
		if (file == null || file.isEmpty()) {
			throw new BadRequestException("فایل CSV ارسال نشده است");
		}
		String filename = file.getOriginalFilename();
		if (filename == null || !filename.toLowerCase(Locale.ROOT).endsWith(".csv")) {
			throw new BadRequestException("فقط فایل با پسوند csv مجاز است");
		}
	}

	private Map<String, Integer> parseHeader(String headerLine) {
		String[] headers = splitCsvLine(headerLine);
		Map<String, Integer> index = new HashMap<>();
		for (int i = 0; i < headers.length; i++) {
			String key = normalizeHeader(headers[i]);
			if (!key.isEmpty()) {
				index.put(key, i);
			}
		}

		List<String> missing = REQUIRED_HEADERS.stream()
				.filter(required -> !index.containsKey(required))
				.toList();
		if (!missing.isEmpty()) {
			throw new BadRequestException(
					"ستون‌های الزامی در CSV وجود ندارد: " + String.join(", ", missing));
		}
		return index;
	}

	private User mapRow(String[] columns, Map<String, Integer> headerIndex) {
		String firstName = requiredValue(columns, headerIndex, "first_name");
		String lastName = requiredValue(columns, headerIndex, "last_name");
		String mobile = requiredValue(columns, headerIndex, "mobile");
		String nationalId = requiredValue(columns, headerIndex, "national_id");
		String status = optionalValue(columns, headerIndex, "status");
		if (status == null || status.isBlank()) {
			status = DEFAULT_STATUS;
		}

		LocalDate birthDate = null;
		String birthDateRaw = optionalValue(columns, headerIndex, "birth_date");
		if (birthDateRaw != null && !birthDateRaw.isBlank()) {
			try {
				birthDate = JalaliDateUtils.parseJalaliToGregorian(birthDateRaw);
			} catch (IllegalArgumentException ex) {
				throw new BadRequestException(ex.getMessage());
			}
		}

		User user = new User();
		user.setFirstName(firstName.trim());
		user.setLastName(lastName.trim());
		user.setMobile(mobile.trim());
		user.setNationalId(nationalId.trim());
		user.setBirthDate(birthDate);
		user.setStatus(status.trim());
		return user;
	}

	private String requiredValue(String[] columns, Map<String, Integer> headerIndex, String header) {
		String value = optionalValue(columns, headerIndex, header);
		if (value == null || value.isBlank()) {
			throw new BadRequestException("مقدار " + header + " الزامی است");
		}
		return value;
	}

	private String optionalValue(String[] columns, Map<String, Integer> headerIndex, String header) {
		Integer idx = headerIndex.get(header);
		if (idx == null || idx >= columns.length) {
			return null;
		}
		return columns[idx];
	}

	private String[] splitCsvLine(String line) {
		return line.split(",", -1);
	}

	private String normalizeHeader(String header) {
		return header == null ? "" : header.trim().toLowerCase(Locale.ROOT);
	}

	private String stripBom(String value) {
		if (value != null && !value.isEmpty() && value.charAt(0) == '\uFEFF') {
			return value.substring(1);
		}
		return value;
	}
}
