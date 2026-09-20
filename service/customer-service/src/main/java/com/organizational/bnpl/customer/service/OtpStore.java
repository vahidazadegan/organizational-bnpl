package com.organizational.bnpl.customer.service;

import com.organizational.bnpl.customer.config.OtpProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
@RequiredArgsConstructor
public class OtpStore {

	private final OtpProperties otpProperties;
	private final Map<String, Entry> entries = new ConcurrentHashMap<>();

	public void put(String mobile, String code) {
		Instant expiresAt = Instant.now().plusSeconds(otpProperties.ttlSeconds());
		entries.put(mobile, new Entry(code, expiresAt));
	}

	public boolean consumeIfValid(String mobile, String code) {
		Entry entry = entries.get(mobile);
		if (entry == null) {
			return false;
		}
		if (Instant.now().isAfter(entry.expiresAt())) {
			entries.remove(mobile);
			return false;
		}
		if (!entry.code().equals(code)) {
			return false;
		}
		entries.remove(mobile);
		return true;
	}

	private record Entry(String code, Instant expiresAt) {
	}
}
