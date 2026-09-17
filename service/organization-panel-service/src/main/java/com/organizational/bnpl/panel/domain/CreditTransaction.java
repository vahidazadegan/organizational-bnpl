package com.organizational.bnpl.panel.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(
		name = "credit_transactions",
		uniqueConstraints = {
				@UniqueConstraint(name = "uk_ct_reference_id", columnNames = "reference_id")
		}
)
public class CreditTransaction {

	@Id
	@GeneratedValue(strategy = GenerationType.UUID)
	@Column(name = "id", nullable = false, updatable = false)
	private UUID id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "user_credit_id", nullable = false)
	private UserCredit userCredit;

	@Enumerated(EnumType.STRING)
	@Column(name = "type", nullable = false, length = 40)
	private CreditTransactionType type;

	@Column(name = "amount", nullable = false)
	private Long amount;

	@Column(name = "balance_before", nullable = false)
	private Long balanceBefore;

	@Column(name = "balance_after", nullable = false)
	private Long balanceAfter;

	@Column(name = "reference_type", length = 50)
	private String referenceType;

	@Column(name = "reference_id")
	private UUID referenceId;

	@Column(name = "description", length = 500)
	private String description;

	@CreationTimestamp
	@Column(name = "created_at", nullable = false, updatable = false)
	private Instant createdAt;
}
