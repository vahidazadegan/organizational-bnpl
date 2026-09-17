package com.organizational.bnpl.panel.repository;

import com.organizational.bnpl.panel.domain.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface PaymentRepository extends JpaRepository<Payment, UUID> {

	List<Payment> findByUserId(UUID userId);

	List<Payment> findByInstallmentId(UUID installmentId);
}
