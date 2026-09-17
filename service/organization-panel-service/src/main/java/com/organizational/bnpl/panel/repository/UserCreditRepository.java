package com.organizational.bnpl.panel.repository;

import com.organizational.bnpl.panel.domain.UserCredit;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserCreditRepository extends JpaRepository<UserCredit, UUID> {

	List<UserCredit> findByUserId(UUID userId);

	List<UserCredit> findByOrganizationId(UUID organizationId);

	Optional<UserCredit> findByUserIdAndOrganizationId(UUID userId, UUID organizationId);
}
