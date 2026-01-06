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

  // Relazione con l'utente: Ogni transazione appartiene a UN utente
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", nullable = false)
  // Questa annotazione dice: "Quando stampi l'utente, non stampare password e roba tecnica, o vai in loop"
  @JsonIgnoreProperties({"password", "email", "hibernateLazyInitializer", "handler"}) // <--- Aggiungi questo
  private User user;
}
