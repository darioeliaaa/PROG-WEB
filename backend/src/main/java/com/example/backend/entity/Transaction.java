package com.example.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.math.BigDecimal;

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

  // --- RELAZIONI (FIX LOOP INFINITO) ---

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", nullable = false)
  @JsonIgnore // <--- FONDAMENTALE: Spezza il ciclo User -> Transactions -> User
  private User user;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "wallet_id", nullable = false)
  @JsonIgnore // <--- FONDAMENTALE: Spezza il ciclo Wallet -> Transactions -> Wallet
  private Wallet wallet;
}
