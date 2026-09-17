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
@Table(name = "purchases")
public class Purchase {

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

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "user_credit_id", nullable = false)
	private UserCredit userCredit;

	@Column(name = "merchant_id")
	private UUID merchantId;

	@Column(name = "shop_name", length = 200)
	private String shopName;

	@Column(name = "description", length = 500)
	private String description;

	@Column(name = "amount", nullable = false)
	private Long amount;

	@Column(name = "currency", nullable = false, length = 3)
	private String currency = "IRR";

	@Enumerated(EnumType.STRING)
	@Column(name = "status", nullable = false, length = 30)
	private PurchaseStatus status;

	@Column(name = "order_number", length = 100)
	private String orderNumber;

	@Column(name = "external_reference", length = 100)
	private String externalReference;

	@Column(name = "purchased_at", nullable = false)
	private Instant purchasedAt;

	@CreationTimestamp
	@Column(name = "created_at", nullable = false, updatable = false)
	private Instant createdAt;

	@UpdateTimestamp
	@Column(name = "updated_at", nullable = false)
	private Instant updatedAt;
}
