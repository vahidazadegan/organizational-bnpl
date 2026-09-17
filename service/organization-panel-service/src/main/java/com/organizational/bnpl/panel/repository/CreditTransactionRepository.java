package com.organizational.bnpl.panel.repository;

import com.organizational.bnpl.panel.domain.CreditTransaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface CreditTransactionRepository extends JpaRepository<CreditTransaction, UUID> {

	List<CreditTransaction> findByUserCreditId(UUID userCreditId);

	List<CreditTransaction> findByUserCreditIdOrderByCreatedAtDesc(UUID userCreditId);
}
