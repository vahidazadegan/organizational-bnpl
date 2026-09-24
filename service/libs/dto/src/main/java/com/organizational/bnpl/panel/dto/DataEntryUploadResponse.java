package com.organizational.bnpl.panel.dto;

import com.organizational.bnpl.panel.domain.DataEntryFileStatus;
import com.organizational.bnpl.panel.domain.DataEntryFileType;

import java.util.UUID;

public record DataEntryUploadResponse(
		UUID id,
		String fileName,
		DataEntryFileType fileType,
		DataEntryFileStatus status
) {
}
