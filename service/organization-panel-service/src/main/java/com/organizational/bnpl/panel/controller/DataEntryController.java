package com.organizational.bnpl.panel.controller;

import com.organizational.bnpl.panel.dto.DataEntryFileResponse;
import com.organizational.bnpl.panel.dto.DataEntryUploadResponse;
import com.organizational.bnpl.panel.dto.PageResponse;
import com.organizational.bnpl.panel.service.DataEntryService;
import com.organizational.bnpl.panel.util.JwtUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@RestController
@RequestMapping("/data-entry/files")
@RequiredArgsConstructor
public class DataEntryController {

	private final DataEntryService dataEntryService;

	@GetMapping
	@Operation(
			summary = "فهرست صفحه‌بندی‌شده فایل‌های ورود اطلاعات",
			description = """
					فایل‌های متعلق به سازمان توکن را برمی‌گرداند.
					فیلترهای اختیاری: fileName، fileType (USERS|CREDIT_ALLOCATION)، status.
					صفحه‌بندی: page از ۱ (پیش‌فرض ۱)، size پیش‌فرض ۸ و حداکثر ۱۰۰.
					""")
	public PageResponse<DataEntryFileResponse> search(
			@Parameter(description = "نام فایل (جست‌وجوی جزئی)")
			@RequestParam(required = false) String fileName,
			@Parameter(description = "نوع فایل: USERS یا CREDIT_ALLOCATION")
			@RequestParam(required = false) String fileType,
			@Parameter(description = "وضعیت: PENDING|PROCESSING|COMPLETED|FAILED")
			@RequestParam(required = false) String status,
			@Parameter(description = "شماره صفحه (از ۱)")
			@RequestParam(required = false) Integer page,
			@Parameter(description = "اندازه صفحه (۱ تا ۱۰۰)")
			@RequestParam(required = false) Integer size,
			@Parameter(hidden = true) @AuthenticationPrincipal Jwt jwt) {
		return dataEntryService.search(
				JwtUtils.getOrganizationId(jwt),
				fileName,
				fileType,
				status,
				page,
				size);
	}

	@PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	@Operation(
			summary = "بارگذاری فایل CSV ورود اطلاعات",
			description = """
					fileTypeهای پشتیبانی‌شده:
					- USERS: first_name, last_name, mobile, national_id (+ birth_date شمسی، status)
					- CREDIT_ALLOCATION: national_id, credit_limit, annual_interest_rate,
					  repayment_months, allocation_token
					  (+ valid_from/valid_until شمسی yyyyMMdd، status، currency)
					حداکثر حجم فایل آپلود و فایل نتیجه قابل دانلود: ۱۰ مگابایت.
					پس از پردازش، رکورد در فهرست ظاهر می‌شود و فایل نتیجه قابل دانلود است.
					""")
	public DataEntryUploadResponse upload(
			@Parameter(
					description = "فایل CSV",
					required = true,
					content = @Content(
							mediaType = MediaType.APPLICATION_OCTET_STREAM_VALUE,
							schema = @Schema(type = "string", format = "binary")))
			@RequestPart("file") MultipartFile file,
			@Parameter(description = "نوع فایل: USERS یا CREDIT_ALLOCATION", required = true)
			@RequestPart("fileType") String fileType,
			@Parameter(hidden = true) @AuthenticationPrincipal Jwt jwt) {
		return dataEntryService.upload(
				file,
				fileType,
				JwtUtils.getOrganizationId(jwt),
				JwtUtils.getUserId(jwt));
	}

	@GetMapping("/{id}/result")
	@Operation(
			summary = "دانلود فایل نتیجه پردازش",
			description = "CSV نتیجه (موفق/ناموفق به‌ازای ردیف‌ها) را برمی‌گرداند. حداکثر حجم: ۱۰ مگابایت.")
	public ResponseEntity<Resource> downloadResult(
			@PathVariable UUID id,
			@Parameter(hidden = true) @AuthenticationPrincipal Jwt jwt) {
		Resource resource = dataEntryService.downloadResult(id, JwtUtils.getOrganizationId(jwt));
		String filename = resource.getFilename() == null ? "result.csv" : resource.getFilename();
		return ResponseEntity.ok()
				.header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
				.contentType(MediaType.parseMediaType("text/csv;charset=UTF-8"))
				.body(resource);
	}
}
