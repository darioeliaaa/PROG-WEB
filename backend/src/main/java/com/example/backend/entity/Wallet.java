package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.util.HashSet;
import java.util.Set;
import java.math.BigDecimal; // Importante per il budget
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Data
@Table(name = "wallets")
public class Wallet {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  private String name;

  // Se true, è il wallet creato alla registrazione (non eliminabile)
  private boolean personal = false;

  // --- NUOVE FUNZIONI ADMIN ---

  // 1. L'utente che ha creato il wallet e ha i permessi di gestione
  @ManyToOne
  @JoinColumn(name = "admin_id")
  @JsonIgnoreProperties({"wallets", "password", "email"})
  private User admin;

  // 2. Budget mensile massimo (opzionale, impostato dall'admin)
  private BigDecimal monthlyBudget;

  // 3. Stato del wallet (se false, nessuno può aggiungere transazioni)
  private boolean active = true;

  // --- RELAZIONI ESISTENTI ---

  @ManyToMany(mappedBy = "wallets")
  @JsonIgnoreProperties("wallets")
  private Set<User> members = new HashSet<>();
}
