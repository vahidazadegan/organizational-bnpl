package com.organizational.bnpl.panel.repository.specification;

import com.organizational.bnpl.panel.domain.Purchase;
import com.organizational.bnpl.panel.domain.PurchaseStatus;
import com.organizational.bnpl.panel.domain.User;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import org.springframework.data.jpa.domain.Specification;

import java.util.Locale;
import java.util.UUID;

public final class PurchaseSpecifications {

	private PurchaseSpecifications() {
	}

	public static Specification<Purchase> belongsToOrganization(UUID organizationId) {
		return (root, query, cb) -> cb.equal(root.get("organization").get("id"), organizationId);
	}

	public static Specification<Purchase> fetchUser() {
		return (root, query, cb) -> {
			if (query != null && Purchase.class.equals(query.getResultType())) {
				root.fetch("user", JoinType.LEFT);
				query.distinct(true);
			}
			return cb.conjunction();
		};
	}

	public static Specification<Purchase> userNameContains(String name) {
		if (isBlank(name)) {
			return Specification.unrestricted();
		}
		String pattern = "%" + name.trim().toLowerCase(Locale.ROOT) + "%";
		return (root, query, cb) -> {
			Join<Purchase, User> user = root.join("user", JoinType.INNER);
			return cb.or(
					cb.like(cb.lower(user.get("firstName")), pattern),
					cb.like(cb.lower(user.get("lastName")), pattern),
					cb.like(
							cb.lower(cb.concat(cb.concat(user.get("firstName"), " "), user.get("lastName"))),
							pattern));
		};
	}

	public static Specification<Purchase> userMobileContains(String mobile) {
		if (isBlank(mobile)) {
			return Specification.unrestricted();
		}
		String pattern = "%" + mobile.trim() + "%";
		return (root, query, cb) -> {
			Join<Purchase, User> user = root.join("user", JoinType.INNER);
			return cb.like(user.get("mobile"), pattern);
		};
	}

	public static Specification<Purchase> userNationalIdContains(String nationalId) {
		if (isBlank(nationalId)) {
			return Specification.unrestricted();
		}
		String pattern = "%" + nationalId.trim() + "%";
		return (root, query, cb) -> {
			Join<Purchase, User> user = root.join("user", JoinType.INNER);
			return cb.like(user.get("nationalId"), pattern);
		};
	}

	public static Specification<Purchase> hasStatus(PurchaseStatus status) {
		if (status == null) {
			return Specification.unrestricted();
		}
		return (root, query, cb) -> cb.equal(root.get("status"), status);
	}

	public static Specification<Purchase> orderNumberContains(String orderNumber) {
		if (isBlank(orderNumber)) {
			return Specification.unrestricted();
		}
		String pattern = "%" + orderNumber.trim().toLowerCase(Locale.ROOT) + "%";
		return (root, query, cb) -> cb.like(cb.lower(root.get("orderNumber")), pattern);
	}

	public static Specification<Purchase> shopNameContains(String shopName) {
		if (isBlank(shopName)) {
			return Specification.unrestricted();
		}
		String pattern = "%" + shopName.trim().toLowerCase(Locale.ROOT) + "%";
		return (root, query, cb) -> cb.like(cb.lower(root.get("shopName")), pattern);
	}

	public static Specification<Purchase> withFilters(
			UUID organizationId,
			String name,
			String mobile,
			String nationalId,
			PurchaseStatus status,
			String orderNumber,
			String shopName) {
		return belongsToOrganization(organizationId)
				.and(fetchUser())
				.and(userNameContains(name))
				.and(userMobileContains(mobile))
				.and(userNationalIdContains(nationalId))
				.and(hasStatus(status))
				.and(orderNumberContains(orderNumber))
				.and(shopNameContains(shopName));
	}

	private static boolean isBlank(String value) {
		return value == null || value.isBlank();
	}
}
