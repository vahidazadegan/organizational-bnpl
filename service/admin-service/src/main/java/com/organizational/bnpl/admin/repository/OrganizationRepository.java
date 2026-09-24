package com.organizational.bnpl.admin.repository;

import com.organizational.bnpl.panel.domain.identity.Organization;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface OrganizationRepository extends JpaRepository<Organization, UUID> {

	List<Organization> findAllByOrderByNameAsc();

	boolean existsByCodeIgnoreCase(String code);

	boolean existsByNationalId(String nationalId);
}
