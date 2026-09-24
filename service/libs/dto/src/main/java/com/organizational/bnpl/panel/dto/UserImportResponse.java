package com.organizational.bnpl.panel.dto;

import java.util.List;

public record UserImportResponse(
		int totalRows,
		int imported,
		int skipped,
		List<RowError> errors
) {

	public record RowError(int rowNumber, String message) {
	}
}
