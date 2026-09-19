package com.organizational.bnpl.panel.service;

import com.organizational.bnpl.panel.domain.Organization;
import com.organizational.bnpl.panel.domain.User;
import com.organizational.bnpl.panel.domain.UserCredit;
import com.organizational.bnpl.panel.dto.UserImportResponse;
import com.organizational.bnpl.panel.exception.BadRequestException;
import com.organizational.bnpl.panel.repository.OrganizationRepository;
import com.organizational.bnpl.panel.repository.UserCreditRepository;
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
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
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
public class CreditAllocationImportService {

	private static final String DEFAULT_STATUS = "ACTIVE";
	private static final String DEFAULT_CURRENCY = "IRR";
	private static final int MAX_ALLOCATION_TOKEN_LENGTH = 5000;
	private static final List<String> REQUIRED_HEADERS = List.of(
			"national_id",
			"credit_limit",
			"annual_interest_rate",
			"repayment_months",
			"allocation_token");

	private final UserRepository userRepository;
	private final UserOrganizationRepository userOrganizationRepository;
	private final UserCreditRepository userCreditRepository;
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

			List<UserCredit> creditsToSave = new ArrayList<>();
			List<UserImportResponse.RowError> errors = new ArrayList<>();
			Set<String> batchNationalIds = new HashSet<>();
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
					MappedCredit mapped = mapRow(columns, headerIndex);

					if (!batchNationalIds.add(mapped.nationalId())) {
						skipped++;
						errors.add(new UserImportResponse.RowError(
								rowNumber, "کد ملی تکراری در همین فایل"));
						continue;
					}

					User user = userRepository.findByNationalId(mapped.nationalId())
							.orElseThrow(() -> new BadRequestException(
									"کاربری با این کد ملی یافت نشد: " + mapped.nationalId()));

					if (!userOrganizationRepository.existsByUserIdAndOrganizationId(
							user.getId(), organization.getId())) {
						skipped++;
						errors.add(new UserImportResponse.RowError(
								rowNumber, "کاربر به این سازمان متصل نشده است"));
						continue;
					}

					UserCredit credit = userCreditRepository
							.findByUserIdAndOrganizationId(user.getId(), organization.getId())
							.orElseGet(UserCredit::new);

					if (credit.getId() == null) {
						credit.setUser(user);
						credit.setOrganization(organization);
						credit.setUsedCredit(0L);
					}

					credit.setCreditLimit(mapped.creditLimit());
					credit.setAnnualInterestRate(mapped.annualInterestRate());
					credit.setRepaymentMonths(mapped.repaymentMonths());
					credit.setAllocationToken(mapped.allocationToken());
					credit.setStatus(mapped.status());
					credit.setCurrency(mapped.currency());
					credit.setValidFrom(mapped.validFrom());
					credit.setValidUntil(mapped.validUntil());

					creditsToSave.add(credit);
					imported++;
				} catch (BadRequestException ex) {
					skipped++;
					errors.add(new UserImportResponse.RowError(rowNumber, ex.getMessage()));
				}
			}

			if (!creditsToSave.isEmpty()) {
				userCreditRepository.saveAll(creditsToSave);
			}

			log.info(
					"CSV credit allocation finished: org={}, total={}, imported={}, skipped={}",
					organization.getId(),
					totalRows,
					imported,
					skipped);

			return new UserImportResponse(totalRows, imported, skipped, errors);
		} catch (BadRequestException ex) {
			throw ex;
		} catch (Exception ex) {
			log.error("Failed to import credit allocations from CSV", ex);
			throw new BadRequestException("خواندن فایل CSV با خطا مواجه شد");
		}
	}

	private MappedCredit mapRow(String[] columns, Map<String, Integer> headerIndex) {
		String nationalId = requiredValue(columns, headerIndex, "national_id").trim();
		long creditLimit = parsePositiveLong(
				requiredValue(columns, headerIndex, "credit_limit"), "credit_limit");
		BigDecimal annualInterestRate = parseNonNegativeDecimal(
				requiredValue(columns, headerIndex, "annual_interest_rate"),
				"annual_interest_rate");
		int repaymentMonths = parsePositiveInt(
				requiredValue(columns, headerIndex, "repayment_months"), "repayment_months");
		String allocationToken = requiredValue(columns, headerIndex, "allocation_token").trim();
		if (allocationToken.length() > MAX_ALLOCATION_TOKEN_LENGTH) {
			throw new BadRequestException(
					"طول allocation_token نباید بیشتر از " + MAX_ALLOCATION_TOKEN_LENGTH + " باشد");
		}

		String status = optionalValue(columns, headerIndex, "status");
		if (status == null || status.isBlank()) {
			status = DEFAULT_STATUS;
		} else {
			status = status.trim().toUpperCase(Locale.ROOT);
		}

		String currency = optionalValue(columns, headerIndex, "currency");
		if (currency == null || currency.isBlank()) {
			currency = DEFAULT_CURRENCY;
		} else {
			currency = currency.trim().toUpperCase(Locale.ROOT);
		}

		Instant validFrom = parseOptionalJalaliInstant(columns, headerIndex, "valid_from");
		Instant validUntil = parseOptionalJalaliInstant(columns, headerIndex, "valid_until");
		if (validFrom != null && validUntil != null && validUntil.isBefore(validFrom)) {
			throw new BadRequestException("valid_until نمی‌تواند قبل از valid_from باشد");
		}

		return new MappedCredit(
				nationalId,
				creditLimit,
				annualInterestRate,
				repaymentMonths,
				allocationToken,
				status,
				currency,
				validFrom,
				validUntil);
	}

	private Instant parseOptionalJalaliInstant(
			String[] columns,
			Map<String, Integer> headerIndex,
			String header) {
		String raw = optionalValue(columns, headerIndex, header);
		if (raw == null || raw.isBlank()) {
			return null;
		}
		try {
			LocalDate jalaliDate = JalaliDateUtils.parseJalaliToGregorian(raw.trim());
			return jalaliDate.atStartOfDay(ZoneOffset.UTC).toInstant();
		} catch (IllegalArgumentException ex) {
			throw new BadRequestException(ex.getMessage());
		}
	}

	private long parsePositiveLong(String raw, String field) {
		try {
			long value = Long.parseLong(raw.trim());
			if (value <= 0) {
				throw new BadRequestException(field + " باید بزرگ‌تر از صفر باشد");
			}
			return value;
		} catch (NumberFormatException ex) {
			throw new BadRequestException(field + " نامعتبر است");
		}
	}

	private int parsePositiveInt(String raw, String field) {
		try {
			int value = Integer.parseInt(raw.trim());
			if (value <= 0) {
				throw new BadRequestException(field + " باید بزرگ‌تر از صفر باشد");
			}
			return value;
		} catch (NumberFormatException ex) {
			throw new BadRequestException(field + " نامعتبر است");
		}
	}

	private BigDecimal parseNonNegativeDecimal(String raw, String field) {
		try {
			BigDecimal value = new BigDecimal(raw.trim());
			if (value.compareTo(BigDecimal.ZERO) < 0) {
				throw new BadRequestException(field + " نمی‌تواند منفی باشد");
			}
			return value;
		} catch (NumberFormatException ex) {
			throw new BadRequestException(field + " نامعتبر است");
		}
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

	private record MappedCredit(
			String nationalId,
			long creditLimit,
			BigDecimal annualInterestRate,
			int repaymentMonths,
			String allocationToken,
			String status,
			String currency,
			Instant validFrom,
			Instant validUntil) {
	}
}
