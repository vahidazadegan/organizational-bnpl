package com.organizational.bnpl.panel.mapper;

import com.organizational.bnpl.panel.domain.UserCredit;
import com.organizational.bnpl.panel.dto.UserCreditResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UserCreditMapper {

	@Mapping(target = "userId", source = "user.id")
	@Mapping(target = "organizationId", source = "organization.id")
	UserCreditResponse toResponse(UserCredit credit);
}
