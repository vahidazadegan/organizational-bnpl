package com.organizational.bnpl.panel.domain;

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

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(
		name = "organizations",
		uniqueConstraints = {
				@UniqueConstraint(name = "uk_organizations_code", columnNames = "code"),
				@UniqueConstraint(name = "uk_organizations_national_id", columnNames = "national_id")
		}
)
public class Organization {

	@Id
	@GeneratedValue(strategy = GenerationType.UUID)
	@Column(name = "id", nullable = false, updatable = false)
	private UUID id;

	@Column(name = "code", nullable = false, length = 50)
	private String code;

	@Column(name = "name", nullable = false, length = 200)
	private String name;

	@Column(name = "national_id", length = 20)
	private String nationalId;

	@Column(name = "status", nullable = false, length = 20)
	private String status;

	@Column(name = "email", length = 255)
	private String email;

	@Column(name = "phone", length = 30)
	private String phone;
}
