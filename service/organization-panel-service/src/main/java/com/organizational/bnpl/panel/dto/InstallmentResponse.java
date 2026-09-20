package com.organizational.bnpl.panel.dto;

import com.organizational.bnpl.panel.domain.InstallmentStatus;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record InstallmentResponse(
		UUID id,
		Integer installmentNumber,
		Long amount,
		Long paidAmount,
		LocalDate dueDate,
		Instant paidAt,
		InstallmentStatus status,
		Instant createdAt,
		Instant updatedAt
) {
}
