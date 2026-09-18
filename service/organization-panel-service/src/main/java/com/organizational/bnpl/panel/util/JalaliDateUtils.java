package com.organizational.bnpl.panel.util;

import com.ibm.icu.util.Calendar;
import com.ibm.icu.util.GregorianCalendar;
import com.ibm.icu.util.PersianCalendar;

import java.time.LocalDate;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Converts between Jalali (Persian/Shamsi) and Gregorian dates using IBM ICU4J.
 */
public final class JalaliDateUtils {

	private static final Pattern JALALI_DATE_PATTERN = Pattern.compile("^(\\d{4})(\\d{2})(\\d{2})$");

	private JalaliDateUtils() {
	}

	/**
	 * Parses a Jalali date string ({@code yyyyMMdd})
	 * and returns the equivalent Gregorian {@link LocalDate}.
	 *
	 * @throws IllegalArgumentException if the value is blank or not a valid Jalali date
	 */
	public static LocalDate parseJalaliToGregorian(String value) {
		if (value == null || value.isBlank()) {
			throw new IllegalArgumentException("تاریخ شمسی خالی است");
		}

		String normalized = toAsciiDigits(value.trim());
		Matcher matcher = JALALI_DATE_PATTERN.matcher(normalized);
		if (!matcher.matches()) {
			throw new IllegalArgumentException(
					"فرمت تاریخ شمسی نامعتبر است (yyyyMMdd): " + value);
		}

		int year = Integer.parseInt(matcher.group(1));
		int month = Integer.parseInt(matcher.group(2));
		int day = Integer.parseInt(matcher.group(3));
		return toGregorian(year, month, day);
	}

	/**
	 * Converts a Jalali year/month/day to Gregorian {@link LocalDate}.
	 *
	 * @param jalaliYear  Jalali year (e.g. 1370)
	 * @param jalaliMonth Jalali month (1-12)
	 * @param jalaliDay   Jalali day of month (1-31)
	 */
	public static LocalDate toGregorian(int jalaliYear, int jalaliMonth, int jalaliDay) {
		if (jalaliMonth < 1 || jalaliMonth > 12) {
			throw new IllegalArgumentException("ماه شمسی نامعتبر است: " + jalaliMonth);
		}
		if (jalaliDay < 1 || jalaliDay > 31) {
			throw new IllegalArgumentException("روز شمسی نامعتبر است: " + jalaliDay);
		}

		PersianCalendar persian = new PersianCalendar();
		persian.clear();
		persian.setLenient(false);
		persian.set(Calendar.EXTENDED_YEAR, jalaliYear);
		persian.set(Calendar.MONTH, jalaliMonth - 1);
		persian.set(Calendar.DAY_OF_MONTH, jalaliDay);

		try {
			persian.getTimeInMillis();
		} catch (IllegalArgumentException ex) {
			throw new IllegalArgumentException(
					"تاریخ شمسی نامعتبر است: " + jalaliYear + "/" + jalaliMonth + "/" + jalaliDay,
					ex);
		}

		GregorianCalendar gregorian = new GregorianCalendar();
		gregorian.setTimeInMillis(persian.getTimeInMillis());

		return LocalDate.of(
				gregorian.get(Calendar.YEAR),
				gregorian.get(Calendar.MONTH) + 1,
				gregorian.get(Calendar.DAY_OF_MONTH));
	}

	/**
	 * Formats a Gregorian {@link LocalDate} as Jalali {@code yyyy-MM-dd}.
	 * Returns {@code null} when {@code date} is {@code null}.
	 */
	public static String formatGregorianToJalali(LocalDate date) {
		if (date == null) {
			return null;
		}

		GregorianCalendar gregorian = new GregorianCalendar(
				date.getYear(),
				date.getMonthValue() - 1,
				date.getDayOfMonth());

		PersianCalendar persian = new PersianCalendar();
		persian.setTimeInMillis(gregorian.getTimeInMillis());

		int year = persian.get(Calendar.EXTENDED_YEAR);
		int month = persian.get(Calendar.MONTH) + 1;
		int day = persian.get(Calendar.DAY_OF_MONTH);

		return String.format("%04d-%02d-%02d", year, month, day);
	}

	private static String toAsciiDigits(String value) {
		StringBuilder builder = new StringBuilder(value.length());
		for (int i = 0; i < value.length(); i++) {
			char ch = value.charAt(i);
			if (ch >= '\u06F0' && ch <= '\u06F9') {
				builder.append((char) ('0' + (ch - '\u06F0')));
			} else if (ch >= '\u0660' && ch <= '\u0669') {
				builder.append((char) ('0' + (ch - '\u0660')));
			} else {
				builder.append(ch);
			}
		}
		return builder.toString();
	}
}
