package com.organizational.bnpl.admin.dto;

import java.util.UUID;

public record MerchantAccessKeyResponse(
		UUID id,
		String accessId,
		String accessKey
) {
}
