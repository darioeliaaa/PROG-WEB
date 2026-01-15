package com.example.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.ToString;
import lombok.EqualsAndHashCode;

import java.util.ArrayList;
import java.util.List;

@Entity
@Data
@Table(name = "portfolios")
public class Portfolio {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  // Campo necessario per il PortfolioProxy (costruttore)
  private String name;

  // Relazione con Utente (Padre)
  @OneToOne
  @JoinColumn(name = "user_id", referencedColumnName = "id")
  @JsonIgnore // Blocca il loop infinito nel JSON
  @ToString.Exclude // Blocca Lombok dal mandare tutto in crash
  @EqualsAndHashCode.Exclude
  private User user;

  // Totale investito
  private double totalInvested = 0.0;

  // --- RELAZIONE INVESTIMENTI (IL CUORE DEL PROXY) ---
  // 1. fetch = FetchType.LAZY: Requisito esame.
  // 2. NESSUN @JsonIgnore: Così il JSON prova a leggerla e attiva il Proxy.
  // 3. @ToString.Exclude: FONDAMENTALE. Impedisce che un semplice System.out.println(portfolio)
  //    faccia scattare il proxy nel momento sbagliato.
  @OneToMany(mappedBy = "portfolio", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
  @ToString.Exclude
  @EqualsAndHashCode.Exclude
  private List<Investment> investments = new ArrayList<>();
}
