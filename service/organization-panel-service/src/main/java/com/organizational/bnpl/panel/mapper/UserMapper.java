package com.organizational.bnpl.panel.mapper;

import com.organizational.bnpl.panel.domain.User;
import com.organizational.bnpl.panel.dto.UserResponse;
import com.organizational.bnpl.panel.util.JalaliDateUtils;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import java.time.LocalDate;

@Mapper(componentModel = "spring")
public interface UserMapper {

	@Mapping(target = "birthDate", source = "birthDate", qualifiedByName = "toJalaliDate")
	UserResponse toResponse(User user);

	@Named("toJalaliDate")
	default String toJalaliDate(LocalDate birthDate) {
		return JalaliDateUtils.formatGregorianToJalali(birthDate);
	}
}
