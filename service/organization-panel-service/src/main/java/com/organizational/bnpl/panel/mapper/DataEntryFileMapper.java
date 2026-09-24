package com.organizational.bnpl.panel.mapper;

import com.organizational.bnpl.panel.domain.DataEntryFile;
import com.organizational.bnpl.panel.domain.identity.PanelUser;
import com.organizational.bnpl.panel.dto.DataEntryFileResponse;
import com.organizational.bnpl.panel.dto.DataEntryUploadResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

@Mapper(componentModel = "spring")
public interface DataEntryFileMapper {

	@Mapping(target = "uploadedAt", source = "createdAt")
	@Mapping(target = "uploadedBy", source = "uploadedBy", qualifiedByName = "toUploaderName")
	@Mapping(target = "hasResultFile", source = "resultContent", qualifiedByName = "hasResultContent")
	DataEntryFileResponse toResponse(DataEntryFile entity);

	DataEntryUploadResponse toUploadResponse(DataEntryFile entity);

	@Named("toUploaderName")
	default String toUploaderName(PanelUser uploadedBy) {
		if (uploadedBy == null) {
			return "";
		}
		String first = uploadedBy.getFirstName() == null ? "" : uploadedBy.getFirstName().trim();
		String last = uploadedBy.getLastName() == null ? "" : uploadedBy.getLastName().trim();
		String fullName = (first + " " + last).trim();
		if (!fullName.isEmpty()) {
			return fullName;
		}
		return uploadedBy.getUsername() == null ? "" : uploadedBy.getUsername();
	}

	@Named("hasResultContent")
	default boolean hasResultContent(String resultContent) {
		return resultContent != null && !resultContent.isBlank();
	}
}
