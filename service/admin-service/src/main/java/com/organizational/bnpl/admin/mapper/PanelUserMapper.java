package com.organizational.bnpl.admin.mapper;

import com.organizational.bnpl.admin.dto.OrganizationalPanelUserResponse;
import com.organizational.bnpl.panel.domain.identity.PanelUser;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface PanelUserMapper {

	@Mapping(target = "organizationId", source = "organization.id")
	@Mapping(target = "organizationCode", source = "organization.code")
	@Mapping(target = "organizationName", source = "organization.name")
	OrganizationalPanelUserResponse toResponse(PanelUser user);
}
