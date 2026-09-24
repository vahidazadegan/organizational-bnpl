package com.organizational.bnpl.admin.repository;

import com.organizational.bnpl.admin.domain.Merchant;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface MerchantRepository extends JpaRepository<Merchant, UUID> {

	List<Merchant> findAllByOrderByNameAsc();

	Optional<Merchant> findByAccessId(String accessId);

	boolean existsByAccessId(String accessId);
}
