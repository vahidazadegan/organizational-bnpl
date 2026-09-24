package com.organizational.bnpl.admin.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(
		name = "merchants",
		uniqueConstraints = {
				@UniqueConstraint(name = "uk_merchants_access_id", columnNames = "access_id")
		}
)
public class Merchant {

	@Id
	@GeneratedValue(strategy = GenerationType.UUID)
	@Column(name = "id", nullable = false, updatable = false)
	private UUID id;

	@Column(name = "name", nullable = false, length = 200)
	private String name;

	@Column(name = "phone", length = 30)
	private String phone;

	@Column(name = "email", length = 255)
	private String email;

	@Column(name = "access_id", nullable = false, length = 64)
	private String accessId;

	@Column(name = "access_key_hash", nullable = false, length = 255)
	private String accessKeyHash;

	@Column(name = "status", nullable = false, length = 20)
	private String status;

	@CreationTimestamp
	@Column(name = "created_at", nullable = false, updatable = false)
	private Instant createdAt;

	@UpdateTimestamp
	@Column(name = "updated_at", nullable = false)
	private Instant updatedAt;
}
