package com.example.backend.dto;

public class AssetQuoteDTO {
  private String symbol;
  private String name;
  private double currentPrice;
  private double changePercent; // Fondamentale per freccia rossa/verde
  private String type;          // STOCK, CRYPTO, FOREX
  private String logoUrl;

  // Costruttore
  public AssetQuoteDTO(String symbol, String name, double currentPrice, double changePercent, String type, String logoUrl) {
    this.symbol = symbol;
    this.name = name;
    this.currentPrice = currentPrice;
    this.changePercent = changePercent;
    this.type = type;
    this.logoUrl = logoUrl;
  }

  // Getter e Setter
  public String getSymbol() { return symbol; }
  public void setSymbol(String symbol) { this.symbol = symbol; }

  public String getName() { return name; }
  public void setName(String name) { this.name = name; }

  public double getCurrentPrice() { return currentPrice; }
  public void setCurrentPrice(double currentPrice) { this.currentPrice = currentPrice; }

  public double getChangePercent() { return changePercent; }
  public void setChangePercent(double changePercent) { this.changePercent = changePercent; }

  public String getType() { return type; }
  public void setType(String type) { this.type = type; }

  public String getLogoUrl() { return logoUrl; }
  public void setLogoUrl(String logoUrl) { this.logoUrl = logoUrl; }
}
