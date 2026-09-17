package com.organizational.bnpl.panel.repository;

import com.organizational.bnpl.panel.domain.UserOrganization;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserOrganizationRepository extends JpaRepository<UserOrganization, UUID> {

	List<UserOrganization> findByUserId(UUID userId);

	List<UserOrganization> findByOrganizationId(UUID organizationId);

	Optional<UserOrganization> findByUserIdAndOrganizationId(UUID userId, UUID organizationId);

	boolean existsByUserIdAndOrganizationId(UUID userId, UUID organizationId);
}
