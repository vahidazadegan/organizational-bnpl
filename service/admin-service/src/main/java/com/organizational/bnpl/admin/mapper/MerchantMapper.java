package com.organizational.bnpl.admin.mapper;

import com.organizational.bnpl.admin.domain.Merchant;
import com.organizational.bnpl.admin.dto.MerchantCreatedResponse;
import com.organizational.bnpl.admin.dto.MerchantResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface MerchantMapper {

	MerchantResponse toResponse(Merchant merchant);

	@Mapping(target = "accessKey", source = "accessKey")
	MerchantCreatedResponse toCreatedResponse(Merchant merchant, String accessKey);
}
