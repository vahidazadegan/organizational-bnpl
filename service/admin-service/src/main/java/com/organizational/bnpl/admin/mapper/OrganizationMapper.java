package com.organizational.bnpl.admin.mapper;

import com.organizational.bnpl.admin.dto.OrganizationSummaryResponse;
import com.organizational.bnpl.panel.domain.identity.Organization;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface OrganizationMapper {

	OrganizationSummaryResponse toSummary(Organization organization);
}
