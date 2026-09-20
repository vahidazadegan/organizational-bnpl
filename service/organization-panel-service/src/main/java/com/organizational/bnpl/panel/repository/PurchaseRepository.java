package com.organizational.bnpl.panel.repository;

import com.organizational.bnpl.panel.domain.Purchase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;
import java.util.UUID;

public interface PurchaseRepository extends JpaRepository<Purchase, UUID>, JpaSpecificationExecutor<Purchase> {

	List<Purchase> findByUserId(UUID userId);

	List<Purchase> findByOrganizationId(UUID organizationId);

	List<Purchase> findByUserCreditId(UUID userCreditId);

	boolean existsByIdAndOrganizationId(UUID id, UUID organizationId);
}
