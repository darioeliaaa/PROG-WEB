package com.example.backend.dto;

import lombok.Data;

@Data
public class TradeRequestDTO {
  // Chi sta comprando?
  private Long userId;

  // Cosa sta comprando?
  private String symbol;      // Es. "AAPL"
  private String assetName;   // Es. "Apple Inc."

  // Dettagli operazione
  private double quantity;    // Es. 2.5 azioni
  private double priceAtTransaction; // Prezzo al momento del click (es. 150.20)

  // Tipo operazione
  private String action;      // "BUY" o "SELL"
}
