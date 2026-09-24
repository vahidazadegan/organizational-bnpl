package com.organizational.bnpl.panel.service;

import com.organizational.bnpl.panel.domain.DataEntryFile;
import com.organizational.bnpl.panel.domain.DataEntryFileStatus;
import com.organizational.bnpl.panel.domain.DataEntryFileType;
import com.organizational.bnpl.panel.domain.identity.Organization;
import com.organizational.bnpl.panel.domain.identity.PanelUser;
import com.organizational.bnpl.panel.dto.DataEntryFileResponse;
import com.organizational.bnpl.panel.dto.DataEntryUploadResponse;
import com.organizational.bnpl.panel.dto.PageResponse;
import com.organizational.bnpl.panel.dto.UserImportResponse;
import com.organizational.bnpl.panel.exception.BadRequestException;
import com.organizational.bnpl.panel.exception.NotFoundException;
import com.organizational.bnpl.panel.mapper.DataEntryFileMapper;
import com.organizational.bnpl.panel.repository.DataEntryFileRepository;
import com.organizational.bnpl.panel.repository.OrganizationRepository;
import com.organizational.bnpl.panel.repository.PanelUserRepository;
import com.organizational.bnpl.panel.repository.specification.DataEntryFileSpecifications;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.nio.charset.StandardCharsets;
import java.util.Locale;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class DataEntryService {

	private static final int DEFAULT_PAGE = 1;
	private static final int DEFAULT_SIZE = 8;
	private static final int MAX_SIZE = 100;
	/** Max size for upload and downloadable result CSV (matches spring.servlet.multipart). */
	private static final long MAX_FILE_BYTES = 10L * 1024 * 1024;

	private final DataEntryFileRepository dataEntryFileRepository;
	private final OrganizationRepository organizationRepository;
	private final PanelUserRepository panelUserRepository;
	private final DataEntryUserImportProcessor dataEntryUserImportProcessor;
	private final DataEntryCreditAllocationProcessor dataEntryCreditAllocationProcessor;
	private final DataEntryFileMapper dataEntryFileMapper;

	@Transactional(readOnly = true)
	public PageResponse<DataEntryFileResponse> search(
			UUID organizationId,
			String fileName,
			String fileType,
			String status,
			Integer page,
			Integer size) {
		int pageNumber = normalizePage(page);
		int pageSize = normalizeSize(size);
		DataEntryFileType typeFilter = parseFileType(fileType, false);
		DataEntryFileStatus statusFilter = parseStatus(status);

		PageRequest pageable = PageRequest.of(
				pageNumber - 1,
				pageSize,
				Sort.by(Sort.Direction.DESC, "createdAt"));

		Specification<DataEntryFile> spec = DataEntryFileSpecifications.withFilters(
						organizationId,
						fileName,
						typeFilter,
						statusFilter)
				.and(DataEntryFileSpecifications.fetchUploader());

		Page<DataEntryFile> result = dataEntryFileRepository.findAll(spec, pageable);
		return PageResponse.map(result, pageNumber, dataEntryFileMapper::toResponse);
	}

	@Transactional
	public DataEntryUploadResponse upload(
			MultipartFile file,
			String fileType,
			UUID organizationId,
			UUID panelUserId) {
		validateUploadFile(file);
		DataEntryFileType type = parseFileType(fileType, true);
		if (type != DataEntryFileType.USERS && type != DataEntryFileType.CREDIT_ALLOCATION) {
			throw new BadRequestException(
					"نوع فایل پشتیبانی نمی‌شود؛ مقادیر مجاز: USERS، CREDIT_ALLOCATION");
		}

		Organization organization = organizationRepository.findById(organizationId)
				.orElseThrow(() -> new BadRequestException("سازمان معتبر یافت نشد"));
		PanelUser uploader = panelUserRepository.findById(panelUserId)
				.orElseThrow(() -> new BadRequestException("کاربر پنل معتبر یافت نشد"));

		String originalName = file.getOriginalFilename() == null
				? "upload.csv"
				: file.getOriginalFilename();

		DataEntryFile entry = new DataEntryFile();
		entry.setOrganization(organization);
		entry.setUploadedBy(uploader);
		entry.setFileName(originalName);
		entry.setFileType(type);
		entry.setStatus(DataEntryFileStatus.PROCESSING);
		entry = dataEntryFileRepository.save(entry);

		try {
			UserImportResponse importResult = processByType(type, file, organizationId);
			entry.setTotalRows(importResult.totalRows());
			entry.setSuccessRows(importResult.imported());
			entry.setFailedRows(importResult.skipped());
			entry.setResultContent(limitResultContent(buildResultCsv(importResult)));
			entry.setStatus(DataEntryFileStatus.COMPLETED);
		} catch (BadRequestException ex) {
			entry.setTotalRows(0);
			entry.setSuccessRows(0);
			entry.setFailedRows(0);
			entry.setResultContent(limitResultContent(buildFailureResultCsv(ex.getMessage())));
			entry.setStatus(DataEntryFileStatus.FAILED);
			log.warn("Data entry upload failed: id={}, reason={}", entry.getId(), ex.getMessage());
		} catch (Exception ex) {
			entry.setTotalRows(0);
			entry.setSuccessRows(0);
			entry.setFailedRows(0);
			entry.setResultContent(limitResultContent(buildFailureResultCsv("خطای غیرمنتظره در پردازش فایل")));
			entry.setStatus(DataEntryFileStatus.FAILED);
			log.error("Data entry upload failed unexpectedly: id={}", entry.getId(), ex);
		}

		entry = dataEntryFileRepository.save(entry);
		return dataEntryFileMapper.toUploadResponse(entry);
	}

	private UserImportResponse processByType(
			DataEntryFileType type,
			MultipartFile file,
			UUID organizationId) {
		return switch (type) {
			case USERS -> dataEntryUserImportProcessor.processUsersCsv(file, organizationId);
			case CREDIT_ALLOCATION -> dataEntryCreditAllocationProcessor
					.processCreditAllocationCsv(file, organizationId);
		};
	}

	@Transactional(readOnly = true)
	public Resource downloadResult(UUID fileId, UUID organizationId) {
		DataEntryFile entry = dataEntryFileRepository
				.findByIdAndOrganizationIdWithUploader(fileId, organizationId)
				.orElseThrow(() -> new NotFoundException("فایل ورود اطلاعات یافت نشد"));

		if (entry.getResultContent() == null || entry.getResultContent().isBlank()) {
			throw new NotFoundException("فایل نتیجه برای این مورد در دسترس نیست");
		}

		byte[] bytes = entry.getResultContent().getBytes(StandardCharsets.UTF_8);
		if (bytes.length > MAX_FILE_BYTES) {
			throw new BadRequestException("حجم فایل نتیجه از ۱۰ مگابایت بیشتر است و قابل دانلود نیست");
		}

		return new ByteArrayResource(bytes) {
			@Override
			public String getFilename() {
				String base = entry.getFileName() == null ? "result" : entry.getFileName();
				String withoutExt = base.replaceAll("(?i)\\.csv$", "");
				return withoutExt + "-result.csv";
			}
		};
	}

	private void validateUploadFile(MultipartFile file) {
		if (file == null || file.isEmpty()) {
			throw new BadRequestException("فایل CSV ارسال نشده است");
		}
		if (file.getSize() > MAX_FILE_BYTES) {
			throw new BadRequestException("حجم فایل نباید بیشتر از ۱۰ مگابایت باشد");
		}
	}

	/**
	 * Keeps downloadable result CSV within {@link #MAX_FILE_BYTES} (UTF-8).
	 */
	private String limitResultContent(String content) {
		if (content == null || content.isEmpty()) {
			return content;
		}
		byte[] bytes = content.getBytes(StandardCharsets.UTF_8);
		if (bytes.length <= MAX_FILE_BYTES) {
			return content;
		}

		String notice = "\n# truncated: result exceeded 10MB limit\n";
		byte[] noticeBytes = notice.getBytes(StandardCharsets.UTF_8);
		int allowed = (int) MAX_FILE_BYTES - noticeBytes.length;
		if (allowed <= 0) {
			return notice.trim() + "\n";
		}

		String truncated = new String(bytes, 0, allowed, StandardCharsets.UTF_8);
		// Drop a possible partial trailing character from the UTF-8 cut.
		int lastNewline = truncated.lastIndexOf('\n');
		if (lastNewline > 0) {
			truncated = truncated.substring(0, lastNewline + 1);
		}
		log.warn("Data entry result truncated to {} bytes (limit {}MB)", MAX_FILE_BYTES, 10);
		return truncated + notice;
	}

	private String buildResultCsv(UserImportResponse importResult) {
		StringBuilder csv = new StringBuilder();
		csv.append("row_number,status,message\n");
		for (UserImportResponse.RowError error : importResult.errors()) {
			csv.append(error.rowNumber())
					.append(",FAILED,")
					.append(escapeCsv(error.message()))
					.append('\n');
		}
		if (importResult.errors().isEmpty() && importResult.imported() > 0) {
			csv.append("0,SUCCESS,همه ردیف‌های معتبر با موفقیت وارد شدند\n");
		}
		return csv.toString();
	}

	private String buildFailureResultCsv(String message) {
		return "row_number,status,message\n0,FAILED," + escapeCsv(message) + "\n";
	}

	private String escapeCsv(String value) {
		if (value == null) {
			return "";
		}
		String escaped = value.replace("\"", "\"\"");
		if (escaped.contains(",") || escaped.contains("\"") || escaped.contains("\n")) {
			return "\"" + escaped + "\"";
		}
		return escaped;
	}

	private DataEntryFileType parseFileType(String fileType, boolean required) {
		String value = blankToNull(fileType);
		if (value == null) {
			if (required) {
				throw new BadRequestException("نوع فایل الزامی است");
			}
			return null;
		}
		try {
			return DataEntryFileType.valueOf(value.trim().toUpperCase(Locale.ROOT));
		} catch (IllegalArgumentException ex) {
			throw new BadRequestException(
					"نوع فایل نامعتبر است؛ مقادیر مجاز: USERS، CREDIT_ALLOCATION");
		}
	}

	private DataEntryFileStatus parseStatus(String status) {
		String value = blankToNull(status);
		if (value == null) {
			return null;
		}
		try {
			return DataEntryFileStatus.valueOf(value.trim().toUpperCase(Locale.ROOT));
		} catch (IllegalArgumentException ex) {
			throw new BadRequestException(
					"وضعیت نامعتبر است؛ مقادیر مجاز: PENDING، PROCESSING، COMPLETED، FAILED");
		}
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

	private String blankToNull(String value) {
		if (value == null) {
			return null;
		}
		String trimmed = value.trim();
		return trimmed.isEmpty() ? null : trimmed;
	}
}
