package com.organizational.bnpl.panel.service;

import com.organizational.bnpl.panel.dto.UserImportResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

/**
 * Isolates CSV credit-allocation import in a new transaction so a failed import
 * does not roll back the parent data-entry file record.
 */
@Service
@RequiredArgsConstructor
public class DataEntryCreditAllocationProcessor {

	private final CreditAllocationImportService creditAllocationImportService;

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public UserImportResponse processCreditAllocationCsv(MultipartFile file, UUID organizationId) {
		return creditAllocationImportService.importFromCsv(file, organizationId);
	}
}
