package com.organizational.bnpl.panel.dto;

import com.organizational.bnpl.panel.domain.DataEntryFileStatus;
import com.organizational.bnpl.panel.domain.DataEntryFileType;

import java.time.Instant;
import java.util.UUID;

public record DataEntryFileResponse(
		UUID id,
		String fileName,
		DataEntryFileType fileType,
		DataEntryFileStatus status,
		Instant uploadedAt,
		String uploadedBy,
		Integer totalRows,
		Integer successRows,
		Integer failedRows,
		boolean hasResultFile
) {
}
