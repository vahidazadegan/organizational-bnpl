package com.organizational.bnpl.merchant.repository;

import com.organizational.bnpl.panel.domain.Purchase;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface PurchaseRepository extends JpaRepository<Purchase, UUID> {

	boolean existsByMerchantIdAndOrderNumber(UUID merchantId, String orderNumber);

	@Lock(LockModeType.PESSIMISTIC_WRITE)
	@Query("""
			SELECT p FROM Purchase p
			WHERE p.id = :id AND p.merchantId = :merchantId
			""")
	Optional<Purchase> findByIdAndMerchantIdForUpdate(
			@Param("id") UUID id,
			@Param("merchantId") UUID merchantId);
}
