package com.organizational.bnpl.panel.repository.specification;

import com.organizational.bnpl.panel.domain.DataEntryFile;
import com.organizational.bnpl.panel.domain.DataEntryFileStatus;
import com.organizational.bnpl.panel.domain.DataEntryFileType;
import jakarta.persistence.criteria.JoinType;
import org.springframework.data.jpa.domain.Specification;

import java.util.Locale;
import java.util.UUID;

public final class DataEntryFileSpecifications {

	private DataEntryFileSpecifications() {
	}

	public static Specification<DataEntryFile> belongsToOrganization(UUID organizationId) {
		return (root, query, cb) -> cb.equal(root.get("organization").get("id"), organizationId);
	}

	public static Specification<DataEntryFile> fileNameContains(String fileName) {
		if (isBlank(fileName)) {
			return Specification.unrestricted();
		}
		String pattern = "%" + fileName.trim().toLowerCase(Locale.ROOT) + "%";
		return (root, query, cb) -> cb.like(cb.lower(root.get("fileName")), pattern);
	}

	public static Specification<DataEntryFile> hasFileType(DataEntryFileType fileType) {
		if (fileType == null) {
			return Specification.unrestricted();
		}
		return (root, query, cb) -> cb.equal(root.get("fileType"), fileType);
	}

	public static Specification<DataEntryFile> hasStatus(DataEntryFileStatus status) {
		if (status == null) {
			return Specification.unrestricted();
		}
		return (root, query, cb) -> cb.equal(root.get("status"), status);
	}

	public static Specification<DataEntryFile> withFilters(
			UUID organizationId,
			String fileName,
			DataEntryFileType fileType,
			DataEntryFileStatus status) {
		return belongsToOrganization(organizationId)
				.and(fileNameContains(fileName))
				.and(hasFileType(fileType))
				.and(hasStatus(status));
	}

	/**
	 * Eager-load uploader for DTO mapping; skipped on count queries.
	 */
	public static Specification<DataEntryFile> fetchUploader() {
		return (root, query, cb) -> {
			if (query != null
					&& query.getResultType() != null
					&& query.getResultType() != Long.class
					&& query.getResultType() != long.class) {
				root.fetch("uploadedBy", JoinType.LEFT);
				query.distinct(true);
			}
			return cb.conjunction();
		};
	}

	private static boolean isBlank(String value) {
		return value == null || value.isBlank();
	}
}
