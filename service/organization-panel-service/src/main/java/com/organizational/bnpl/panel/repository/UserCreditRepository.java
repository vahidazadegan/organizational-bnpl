package com.organizational.bnpl.panel.repository;

import com.organizational.bnpl.panel.domain.UserCredit;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserCreditRepository extends JpaRepository<UserCredit, UUID> {

	List<UserCredit> findByUserId(UUID userId);

	List<UserCredit> findByOrganizationId(UUID organizationId);

	Optional<UserCredit> findByUserIdAndOrganizationId(UUID userId, UUID organizationId);

	List<UserCredit> findByUserIdAndOrganizationIdOrderByCreatedAtDesc(
			UUID userId,
			UUID organizationId);

	@Lock(LockModeType.PESSIMISTIC_WRITE)
	@Query("""
			SELECT uc FROM UserCredit uc
			WHERE uc.id = :id AND uc.organization.id = :organizationId
			""")
	Optional<UserCredit> findByIdAndOrganizationIdForUpdate(
			@Param("id") UUID id,
			@Param("organizationId") UUID organizationId);
}
