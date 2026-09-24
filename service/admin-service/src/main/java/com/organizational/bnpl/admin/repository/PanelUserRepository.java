package com.organizational.bnpl.admin.repository;

import com.organizational.bnpl.panel.domain.identity.PanelUser;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;
import java.util.UUID;

public interface PanelUserRepository extends JpaRepository<PanelUser, UUID>, JpaSpecificationExecutor<PanelUser> {

	@EntityGraph(attributePaths = "organization")
	Page<PanelUser> findAll(Specification<PanelUser> spec, Pageable pageable);

	@Override
	@EntityGraph(attributePaths = "organization")
	Optional<PanelUser> findById(UUID id);

	boolean existsByUsernameIgnoreCase(String username);
}
