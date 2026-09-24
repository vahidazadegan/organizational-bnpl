package com.organizational.bnpl.common;

import lombok.AccessLevel;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * Builds an equal installment schedule with simple annual interest prorated by tenor.
 *
 * <p>totalInterest = principal × (annualRate% / 100) × (months / 12)
 * <p>Remainder from integer division is applied to the last installment.
 */
@NoArgsConstructor(access = AccessLevel.PRIVATE)
public final class InstallmentScheduleCalculator {

	public static Schedule calculate(
			long principal,
			BigDecimal annualInterestRatePercent,
			int months,
			LocalDate firstDueDate) {
		if (principal <= 0) {
			throw new IllegalArgumentException("مبلغ خرید باید بزرگ‌تر از صفر باشد");
		}
		if (months <= 0) {
			throw new IllegalArgumentException("تعداد ماه بازپرداخت باید بزرگ‌تر از صفر باشد");
		}
		if (annualInterestRatePercent == null || annualInterestRatePercent.signum() < 0) {
			throw new IllegalArgumentException("نرخ سود سالانه نامعتبر است");
		}

		long totalInterest = BigDecimal.valueOf(principal)
				.multiply(annualInterestRatePercent)
				.multiply(BigDecimal.valueOf(months))
				.divide(BigDecimal.valueOf(100L * 12L), 0, RoundingMode.HALF_UP)
				.longValueExact();

		long totalPayable = principal + totalInterest;
		long baseAmount = totalPayable / months;
		long remainder = totalPayable % months;

		List<InstallmentPlan> plans = new ArrayList<>(months);
		for (int i = 1; i <= months; i++) {
			long amount = baseAmount;
			if (i == months) {
				amount += remainder;
			}
			plans.add(new InstallmentPlan(i, amount, firstDueDate.plusMonths(i - 1L)));
		}

		return new Schedule(totalPayable, totalInterest, plans);
	}

	public record InstallmentPlan(int number, long amount, LocalDate dueDate) {
	}

	public record Schedule(long totalPayable, long totalInterest, List<InstallmentPlan> plans) {
	}
}
