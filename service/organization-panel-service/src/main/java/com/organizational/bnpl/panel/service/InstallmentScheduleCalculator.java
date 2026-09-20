package com.organizational.bnpl.panel.service;

import com.organizational.bnpl.panel.exception.BadRequestException;

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
final class InstallmentScheduleCalculator {

	private InstallmentScheduleCalculator() {
	}

	static Schedule calculate(long principal, BigDecimal annualInterestRatePercent, int months, LocalDate firstDueDate) {
		if (principal <= 0) {
			throw new BadRequestException("مبلغ خرید باید بزرگ‌تر از صفر باشد");
		}
		if (months <= 0) {
			throw new BadRequestException("تعداد ماه بازپرداخت باید بزرگ‌تر از صفر باشد");
		}
		if (annualInterestRatePercent == null || annualInterestRatePercent.signum() < 0) {
			throw new BadRequestException("نرخ سود سالانه نامعتبر است");
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

	record InstallmentPlan(int number, long amount, LocalDate dueDate) {
	}

	record Schedule(long totalPayable, long totalInterest, List<InstallmentPlan> plans) {
	}
}
