package com.organizational.bnpl.panel.domain;

import com.organizational.bnpl.panel.domain.identity.Organization;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "user_credits")
public class UserCredit {

	@Id
	@GeneratedValue(strategy = GenerationType.UUID)
	@Column(name = "id", nullable = false, updatable = false)
	private UUID id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "user_id", nullable = false)
	private User user;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "organization_id", nullable = false)
	private Organization organization;

	@Column(name = "credit_limit", nullable = false)
	private Long creditLimit = 0L;

	@Column(name = "used_credit", nullable = false)
	private Long usedCredit = 0L;

	@Column(name = "reserved_credit", nullable = false)
	private Long reservedCredit = 0L;

	@Column(name = "annual_interest_rate", nullable = false, precision = 7, scale = 4)
	private BigDecimal annualInterestRate = BigDecimal.ZERO;

	@Column(name = "repayment_months", nullable = false)
	private Integer repaymentMonths = 0;

	@Column(name = "allocation_token", nullable = false, length = 5000)
	private String allocationToken;

	@Column(name = "currency", nullable = false, length = 3)
	private String currency = "IRR";

	@Column(name = "status", nullable = false, length = 30)
	private String status;

	@Column(name = "valid_from")
	private Instant validFrom;

	@Column(name = "valid_until")
	private Instant validUntil;

	@CreationTimestamp
	@Column(name = "created_at", nullable = false, updatable = false)
	private Instant createdAt;

	@UpdateTimestamp
	@Column(name = "updated_at", nullable = false)
	private Instant updatedAt;
}
