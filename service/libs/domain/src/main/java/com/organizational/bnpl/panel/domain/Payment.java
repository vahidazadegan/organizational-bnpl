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
@Table(name = "payments")
public class Payment {

	@Id
	@GeneratedValue(strategy = GenerationType.UUID)
	@Column(name = "id", nullable = false, updatable = false)
	private UUID id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "user_id", nullable = false)
	private User user;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "installment_id", nullable = false)
	private Installment installment;

	@Column(name = "amount", nullable = false)
	private Long amount;

	@Column(name = "currency", nullable = false, length = 3)
	private String currency = "IRR";

	@Enumerated(EnumType.STRING)
	@Column(name = "payment_method", length = 30)
	private PaymentMethod paymentMethod;

	@Column(name = "status", nullable = false, length = 30)
	private String status;

	@Column(name = "transaction_id", length = 100)
	private String transactionId;

	@Column(name = "external_reference", length = 100)
	private String externalReference;

	@Column(name = "paid_at")
	private Instant paidAt;

	@CreationTimestamp
	@Column(name = "created_at", nullable = false, updatable = false)
	private Instant createdAt;

	@UpdateTimestamp
	@Column(name = "updated_at", nullable = false)
	private Instant updatedAt;
}
