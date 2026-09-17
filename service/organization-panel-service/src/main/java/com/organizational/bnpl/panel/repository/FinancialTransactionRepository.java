package com.organizational.bnpl.panel.repository;

import com.organizational.bnpl.panel.domain.FinancialTransaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface FinancialTransactionRepository extends JpaRepository<FinancialTransaction, UUID> {

	List<FinancialTransaction> findByUserId(UUID userId);

	List<FinancialTransaction> findByOrganizationId(UUID organizationId);
}
