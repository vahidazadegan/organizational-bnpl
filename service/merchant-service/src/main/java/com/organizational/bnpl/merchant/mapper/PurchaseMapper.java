package com.organizational.bnpl.merchant.mapper;

import com.organizational.bnpl.panel.domain.Purchase;
import com.organizational.bnpl.panel.dto.InstallmentResponse;
import com.organizational.bnpl.panel.dto.PurchaseResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring", uses = InstallmentMapper.class)
public interface PurchaseMapper {

	@Mapping(target = "userId", source = "purchase.user.id")
	@Mapping(target = "organizationId", source = "purchase.organization.id")
	@Mapping(target = "userCreditId", source = "purchase.userCredit.id")
	@Mapping(target = "totalPayable", source = "totalPayable")
	@Mapping(target = "installments", source = "installments")
	PurchaseResponse toResponse(Purchase purchase, Long totalPayable, List<InstallmentResponse> installments);
}
