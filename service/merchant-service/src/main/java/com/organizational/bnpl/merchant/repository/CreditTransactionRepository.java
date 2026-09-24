package com.organizational.bnpl.merchant.repository;

import com.organizational.bnpl.panel.domain.CreditTransaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface CreditTransactionRepository extends JpaRepository<CreditTransaction, UUID> {

	Optional<CreditTransaction> findByReferenceId(UUID referenceId);
}
