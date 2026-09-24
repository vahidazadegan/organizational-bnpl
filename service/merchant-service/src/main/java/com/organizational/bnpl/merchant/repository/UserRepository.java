package com.organizational.bnpl.merchant.repository;

import com.organizational.bnpl.panel.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {

	Optional<User> findByMobile(String mobile);
}
