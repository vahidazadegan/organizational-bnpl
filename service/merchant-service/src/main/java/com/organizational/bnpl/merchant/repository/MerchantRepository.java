package com.organizational.bnpl.merchant.repository;

import com.organizational.bnpl.admin.domain.Merchant;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface MerchantRepository extends JpaRepository<Merchant, UUID> {

	Optional<Merchant> findByAccessId(String accessId);
}
