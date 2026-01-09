package com.example.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "market_assets")
public class MarketAsset {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  private String symbol;       // Es: "AAPL"
  private String name;         // Es: "Apple Inc."
  private String type;         // "STOCK", "CRYPTO", "FOREX"

  @Column(length = 500)
  private String logoUrl;      // URL dell'immagine

  // --- COSTRUTTORI ---
  public MarketAsset() {}

  // --- GETTER E SETTER (FONDAMENTALI: Senza questi Java non vede i dati!) ---

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public String getSymbol() {
    return symbol; // <--- Ecco il metodo che ti mancava!
  }

  public void setSymbol(String symbol) {
    this.symbol = symbol;
  }

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public String getType() {
    return type;
  }

  public void setType(String type) {
    this.type = type;
  }

  public String getLogoUrl() {
    return logoUrl;
  }

  public void setLogoUrl(String logoUrl) {
    this.logoUrl = logoUrl;
  }
}
