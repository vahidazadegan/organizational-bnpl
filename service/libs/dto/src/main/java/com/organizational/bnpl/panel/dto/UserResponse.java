package com.organizational.bnpl.panel.dto;

import java.util.UUID;

public record UserResponse(
		UUID id,
		String firstName,
		String lastName,
		String mobile,
		String nationalId,
		/** تاریخ تولد شمسی به فرمت {@code yyyy-MM-dd}؛ در صورت نبود مقدار {@code null}. */
		String birthDate,
		String status
) {
}
