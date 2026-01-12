package com.example.backend.dto;

public class AssetQuoteDTO {
  // Dati Base
  private String symbol;
  private String name;
  private String type;
  private String logoUrl;

  // Dati Prezzo Live (/quote)
  private double currentPrice;
  private double changePercent;
  private double changeValue;    // Quanto è cambiato in $ (es. +2.50$)
  private double highPrice;      // Massimo di oggi
  private double lowPrice;       // Minimo di oggi
  private double openPrice;      // Prezzo apertura
  private double prevClosePrice; // Chiusura precedente

  // Dati Fondamentali (/stock/profile2)
  private double marketCap;      // Capitalizzazione (in Milioni)
  private String industry;       // Settore (es. Technology)
  private String currency;       // Valuta (es. USD)

  // Costruttore vuoto
  public AssetQuoteDTO() {}

  // Costruttore Completo
  public AssetQuoteDTO(String symbol, String name, String type, String logoUrl,
                       double currentPrice, double changePercent, double changeValue,
                       double highPrice, double lowPrice, double openPrice, double prevClosePrice,
                       double marketCap, String industry, String currency) {
    this.symbol = symbol;
    this.name = name;
    this.type = type;
    this.logoUrl = logoUrl;
    this.currentPrice = currentPrice;
    this.changePercent = changePercent;
    this.changeValue = changeValue;
    this.highPrice = highPrice;
    this.lowPrice = lowPrice;
    this.openPrice = openPrice;
    this.prevClosePrice = prevClosePrice;
    this.marketCap = marketCap;
    this.industry = industry;
    this.currency = currency;
  }

  // --- GETTER E SETTER (Generali tutti, ecco i principali nuovi) ---

  public String getSymbol() { return symbol; }
  public void setSymbol(String symbol) { this.symbol = symbol; }

  public String getName() { return name; }
  public void setName(String name) { this.name = name; }

  public String getType() { return type; }
  public void setType(String type) { this.type = type; }

  public String getLogoUrl() { return logoUrl; }
  public void setLogoUrl(String logoUrl) { this.logoUrl = logoUrl; }

  public double getCurrentPrice() { return currentPrice; }
  public void setCurrentPrice(double currentPrice) { this.currentPrice = currentPrice; }

  public double getChangePercent() { return changePercent; }
  public void setChangePercent(double changePercent) { this.changePercent = changePercent; }

  public double getChangeValue() { return changeValue; }
  public void setChangeValue(double changeValue) { this.changeValue = changeValue; }

  public double getHighPrice() { return highPrice; }
  public void setHighPrice(double highPrice) { this.highPrice = highPrice; }

  public double getLowPrice() { return lowPrice; }
  public void setLowPrice(double lowPrice) { this.lowPrice = lowPrice; }

  public double getOpenPrice() { return openPrice; }
  public void setOpenPrice(double openPrice) { this.openPrice = openPrice; }

  public double getPrevClosePrice() { return prevClosePrice; }
  public void setPrevClosePrice(double prevClosePrice) { this.prevClosePrice = prevClosePrice; }

  public double getMarketCap() { return marketCap; }
  public void setMarketCap(double marketCap) { this.marketCap = marketCap; }

  public String getIndustry() { return industry; }
  public void setIndustry(String industry) { this.industry = industry; }

  public String getCurrency() { return currency; }
  public void setCurrency(String currency) { this.currency = currency; }
}
