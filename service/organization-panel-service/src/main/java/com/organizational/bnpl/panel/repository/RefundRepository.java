package com.organizational.bnpl.panel.repository;

import com.organizational.bnpl.panel.domain.Refund;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface RefundRepository extends JpaRepository<Refund, UUID> {

	List<Refund> findByPurchaseId(UUID purchaseId);
}
