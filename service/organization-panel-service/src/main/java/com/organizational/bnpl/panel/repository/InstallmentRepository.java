package com.organizational.bnpl.panel.repository;

import com.organizational.bnpl.panel.domain.Installment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface InstallmentRepository extends JpaRepository<Installment, UUID> {

	List<Installment> findByPurchaseId(UUID purchaseId);

	Page<Installment> findByPurchaseId(UUID purchaseId, Pageable pageable);

	Optional<Installment> findByPurchaseIdAndInstallmentNumber(UUID purchaseId, Integer installmentNumber);
}
