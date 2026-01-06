package com.example.backend.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.time.LocalDate;

@Entity
@Table(name = "investments")
public class Investment {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  private String symbol;       // Es. "AAPL", "TSLA", "BTC"
  private String name;         // Es. "Apple Inc."
  private double quantity;     // Quante ne hai comprate (es. 2.5)
  private double buyPrice;     // Prezzo pagato per singola azione (es. 150.00)
  private LocalDate purchaseDate; // Quando le hai prese

  @ManyToOne
  @JoinColumn(name = "user_id")
  @JsonIgnoreProperties({"password", "email", "transactions", "investments", "hibernateLazyInitializer", "handler"})
  private User user;

  // --- COSTRUTTORI ---
  public Investment() {}

  // --- GETTER E SETTER ---
  public Long getId() { return id; }
  public void setId(Long id) { this.id = id; }

  public String getSymbol() { return symbol; }
  public void setSymbol(String symbol) { this.symbol = symbol.toUpperCase(); } // Sempre maiuscolo

  public String getName() { return name; }
  public void setName(String name) { this.name = name; }

  public double getQuantity() { return quantity; }
  public void setQuantity(double quantity) { this.quantity = quantity; }

  public double getBuyPrice() { return buyPrice; }
  public void setBuyPrice(double buyPrice) { this.buyPrice = buyPrice; }

  public LocalDate getPurchaseDate() { return purchaseDate; }
  public void setPurchaseDate(LocalDate purchaseDate) { this.purchaseDate = purchaseDate; }

  public User getUser() { return user; }
  public void setUser(User user) { this.user = user; }
}
