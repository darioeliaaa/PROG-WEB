package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.time.LocalDate;

@Entity
@Data
@Table(name = "investments")
public class Investment {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  private String symbol;       // Es. "AAPL"
  private String name;         // Es. "Apple Inc."
  private double quantity;     // Quantità totale posseduta

  // Prezzo Medio di Carico (Fondamentale per calcolare il profitto)
  private double averageBuyPrice;

  // Ultima data di acquisto/aggiornamento
  private LocalDate lastUpdateDate;

  // --- CAMBIAMENTO: Collegato al Portfolio, non all'User ---
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "portfolio_id")
  @JsonIgnore // Evita loop infiniti nel JSON
  private Portfolio portfolio;

  // Costruttore vuoto JPA
  public Investment() {}

  // Costruttore di comodità
  public Investment(Portfolio portfolio, String symbol, String name) {
    this.portfolio = portfolio;
    this.symbol = symbol;
    this.name = name;
    this.quantity = 0;
    this.averageBuyPrice = 0;
    this.lastUpdateDate = LocalDate.now();
  }
}
