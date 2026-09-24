package com.organizational.bnpl.panel.repository;

import com.organizational.bnpl.panel.domain.identity.Organization;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface OrganizationRepository extends JpaRepository<Organization, UUID> {

	Optional<Organization> findByCode(String code);

	boolean existsByCode(String code);

	boolean existsByNationalId(String nationalId);
}
