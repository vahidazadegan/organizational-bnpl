package com.organizational.bnpl.merchant.repository;

import com.organizational.bnpl.panel.domain.Installment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface InstallmentRepository extends JpaRepository<Installment, UUID> {
}
