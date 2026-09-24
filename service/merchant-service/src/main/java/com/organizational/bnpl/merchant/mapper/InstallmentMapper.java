package com.organizational.bnpl.merchant.mapper;

import com.organizational.bnpl.panel.domain.Installment;
import com.organizational.bnpl.panel.dto.InstallmentResponse;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface InstallmentMapper {

	InstallmentResponse toResponse(Installment installment);
}
