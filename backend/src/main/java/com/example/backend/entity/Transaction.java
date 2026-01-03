package com.example.backend.entity;

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

  @Column(nullable = false)
  private BigDecimal amount;

  private LocalDate date;

  @Enumerated(EnumType.STRING)
  private TransactionType type;

  // Relazione con l'utente: Ogni transazione appartiene a UN utente
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", nullable = false)
  private User user;
}
