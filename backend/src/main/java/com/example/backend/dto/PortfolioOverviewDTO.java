package com.example.backend.dto;

import lombok.Data;
import java.util.List;

@Data
public class PortfolioOverviewDTO {
  private double currentTotalValue;
  private double totalInvested;
  private double totalProfit;
  private double totalProfitPercent;

  private double availableCash;

  private List<AssetPerformanceDTO> assets;

  @Data
  public static class AssetPerformanceDTO {
    private String symbol;
    private String name;
    private double quantity;
    private double avgBuyPrice;
    private double currentPrice;
    private double currentValue;
    private double profit;
    private double profitPercent;
  }
}
