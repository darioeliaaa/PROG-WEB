package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.math.BigDecimal;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Data
@Table(name = "transactions")
public class Transaction {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  private String description;
  private String category;

  @Column(nullable = false)
  private BigDecimal amount;

  private LocalDate date;

  @Enumerated(EnumType.STRING)
  private TransactionType type;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", nullable = false)
  @JsonIgnoreProperties({"password", "email", "hibernateLazyInitializer", "handler", "wallets"})
  private User user;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "wallet_id", nullable = false)
  @JsonIgnoreProperties({"members", "transactions", "admin", "hibernateLazyInitializer", "handler"})
  private Wallet wallet;
}
