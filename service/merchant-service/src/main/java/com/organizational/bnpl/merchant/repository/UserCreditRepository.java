package com.organizational.bnpl.merchant.repository;

import com.organizational.bnpl.panel.domain.UserCredit;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface UserCreditRepository extends JpaRepository<UserCredit, UUID> {

	@Lock(LockModeType.PESSIMISTIC_WRITE)
	@Query("""
			SELECT uc FROM UserCredit uc
			WHERE uc.user.id = :userId AND uc.organization.id = :organizationId
			""")
	Optional<UserCredit> findByUserIdAndOrganizationIdForUpdate(
			@Param("userId") UUID userId,
			@Param("organizationId") UUID organizationId);

	@Lock(LockModeType.PESSIMISTIC_WRITE)
	@Query("SELECT uc FROM UserCredit uc WHERE uc.id = :id")
	Optional<UserCredit> findByIdForUpdate(@Param("id") UUID id);
}
