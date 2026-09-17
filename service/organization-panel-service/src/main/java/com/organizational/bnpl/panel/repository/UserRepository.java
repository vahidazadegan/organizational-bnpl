package com.organizational.bnpl.panel.repository;

import com.organizational.bnpl.panel.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {

	Optional<User> findByNationalId(String nationalId);

	Optional<User> findByMobile(String mobile);

	boolean existsByNationalId(String nationalId);

	boolean existsByMobile(String mobile);
}
