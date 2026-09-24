package com.organizational.bnpl.admin.dto;

import org.springframework.data.domain.Page;

import java.util.List;
import java.util.function.Function;

/**
 * Generic paginated search response (1-based {@code page}).
 */
public record PageResponse<T>(
		List<T> content,
		int page,
		int size,
		long totalElements,
		int totalPages
) {

	public static <T> PageResponse<T> of(Page<T> result, int pageNumber) {
		return new PageResponse<>(
				result.getContent(),
				pageNumber,
				result.getSize(),
				result.getTotalElements(),
				result.getTotalPages());
	}

	public static <S, T> PageResponse<T> map(Page<S> result, int pageNumber, Function<S, T> mapper) {
		return new PageResponse<>(
				result.getContent().stream().map(mapper).toList(),
				pageNumber,
				result.getSize(),
				result.getTotalElements(),
				result.getTotalPages());
	}
}
