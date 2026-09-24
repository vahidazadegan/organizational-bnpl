package com.organizational.bnpl.admin.repository.specification;

import com.organizational.bnpl.panel.domain.identity.PanelUser;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import org.springframework.data.jpa.domain.Specification;

import java.util.Locale;

public final class PanelUserSpecifications {

	private PanelUserSpecifications() {
	}

	public static Specification<PanelUser> usernameContains(String username) {
		if (isBlank(username)) {
			return Specification.unrestricted();
		}
		String pattern = "%" + username.trim().toLowerCase(Locale.ROOT) + "%";
		return (root, query, cb) -> cb.like(cb.lower(root.get("username")), pattern);
	}

	public static Specification<PanelUser> nameContains(String name) {
		if (isBlank(name)) {
			return Specification.unrestricted();
		}
		String pattern = "%" + name.trim().toLowerCase(Locale.ROOT) + "%";
		return (root, query, cb) -> cb.or(
				cb.like(cb.lower(root.get("firstName")), pattern),
				cb.like(cb.lower(root.get("lastName")), pattern),
				cb.like(
						cb.lower(cb.concat(cb.concat(root.get("firstName"), " "), root.get("lastName"))),
						pattern));
	}

	public static Specification<PanelUser> hasStatus(String status) {
		if (isBlank(status)) {
			return Specification.unrestricted();
		}
		return (root, query, cb) -> cb.equal(root.get("status"), status.trim());
	}

	public static Specification<PanelUser> organizationContains(String organization) {
		if (isBlank(organization)) {
			return Specification.unrestricted();
		}
		String pattern = "%" + organization.trim().toLowerCase(Locale.ROOT) + "%";
		return (root, query, cb) -> {
			Join<?, ?> org = root.join("organization", JoinType.INNER);
			if (query != null) {
				query.distinct(true);
			}
			return cb.or(
					cb.like(cb.lower(org.get("name")), pattern),
					cb.like(cb.lower(org.get("code")), pattern));
		};
	}

	public static Specification<PanelUser> withFilters(
			String username,
			String name,
			String status,
			String organization) {
		return usernameContains(username)
				.and(nameContains(name))
				.and(hasStatus(status))
				.and(organizationContains(organization));
	}

	private static boolean isBlank(String value) {
		return value == null || value.isBlank();
	}
}
