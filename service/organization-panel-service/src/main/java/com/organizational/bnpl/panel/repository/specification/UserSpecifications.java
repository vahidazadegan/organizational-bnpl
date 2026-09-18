package com.organizational.bnpl.panel.repository.specification;

import com.organizational.bnpl.panel.domain.User;
import com.organizational.bnpl.panel.domain.UserOrganization;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Subquery;
import org.springframework.data.jpa.domain.Specification;

import java.util.Locale;
import java.util.UUID;

public final class UserSpecifications {

	private UserSpecifications() {
	}

	public static Specification<User> belongsToOrganization(UUID organizationId) {
		return (root, query, cb) -> {
			Subquery<UUID> subquery = query.subquery(UUID.class);
			Root<UserOrganization> membership = subquery.from(UserOrganization.class);
			subquery.select(membership.get("id"))
					.where(
							cb.equal(membership.get("user"), root),
							cb.equal(membership.get("organization").get("id"), organizationId));
			return cb.exists(subquery);
		};
	}

	public static Specification<User> nameContains(String name) {
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

	public static Specification<User> mobileContains(String mobile) {
		if (isBlank(mobile)) {
			return Specification.unrestricted();
		}
		String pattern = "%" + mobile.trim() + "%";
		return (root, query, cb) -> cb.like(root.get("mobile"), pattern);
	}

	public static Specification<User> nationalIdContains(String nationalId) {
		if (isBlank(nationalId)) {
			return Specification.unrestricted();
		}
		String pattern = "%" + nationalId.trim() + "%";
		return (root, query, cb) -> cb.like(root.get("nationalId"), pattern);
	}

	public static Specification<User> hasStatus(String status) {
		if (isBlank(status)) {
			return Specification.unrestricted();
		}
		return (root, query, cb) -> cb.equal(root.get("status"), status.trim());
	}

	public static Specification<User> withFilters(
			UUID organizationId,
			String name,
			String mobile,
			String nationalId,
			String status) {
		return belongsToOrganization(organizationId)
				.and(nameContains(name))
				.and(mobileContains(mobile))
				.and(nationalIdContains(nationalId))
				.and(hasStatus(status));
	}

	private static boolean isBlank(String value) {
		return value == null || value.isBlank();
	}
}
