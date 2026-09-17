package com.organizational.bnpl.panel.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(
		name = "installments",
		uniqueConstraints = {
				@UniqueConstraint(name = "uk_installment_number", columnNames = {"purchase_id", "installment_number"})
		}
)
public class Installment {

	@Id
	@GeneratedValue(strategy = GenerationType.UUID)
	@Column(name = "id", nullable = false, updatable = false)
	private UUID id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "purchase_id", nullable = false)
	private Purchase purchase;

	@Column(name = "installment_number", nullable = false)
	private Integer installmentNumber;

	@Column(name = "amount", nullable = false)
	private Long amount;

	@Column(name = "paid_amount", nullable = false)
	private Long paidAmount = 0L;

	@Column(name = "due_date", nullable = false)
	private LocalDate dueDate;

	@Column(name = "paid_at")
	private Instant paidAt;

	@Column(name = "status", nullable = false, length = 30)
	private String status;

	@CreationTimestamp
	@Column(name = "created_at", nullable = false, updatable = false)
	private Instant createdAt;

	@UpdateTimestamp
	@Column(name = "updated_at", nullable = false)
	private Instant updatedAt;
}
