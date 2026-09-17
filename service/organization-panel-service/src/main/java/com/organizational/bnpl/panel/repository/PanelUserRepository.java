package com.organizational.bnpl.panel.repository;

import com.organizational.bnpl.panel.domain.PanelUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface PanelUserRepository extends JpaRepository<PanelUser, UUID> {

	Optional<PanelUser> findByUsername(String username);

	@Query("select u from PanelUser u join fetch u.organization where u.username = :username")
	Optional<PanelUser> findByUsernameWithOrganization(@Param("username") String username);

	boolean existsByUsername(String username);
}
