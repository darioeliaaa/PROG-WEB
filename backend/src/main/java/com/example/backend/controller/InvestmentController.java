package com.example.backend.controller;

import com.example.backend.entity.Investment;
import com.example.backend.service.InvestmentService;
import com.example.backend.service.MarketService; // Importante
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/investments")
@CrossOrigin(origins = "http://localhost:4200")
public class InvestmentController {

  @Autowired
  private InvestmentService investmentService;

  @Autowired
  private MarketService marketService; // Il servizio per i prezzi reali

  // COMPRARE (Salvare nel DB)
  @PostMapping("/buy/{userId}")
  public ResponseEntity<Investment> buyStock(@PathVariable Long userId, @RequestBody Investment investment) {
    return ResponseEntity.ok(investmentService.buyStock(userId, investment));
  }

  // VEDERE PORTAFOGLIO (Con prezzi aggiornati da Finnhub)
  @GetMapping("/portfolio/{userId}")
  public ResponseEntity<List<Map<String, Object>>> getPortfolio(@PathVariable Long userId) {

    // 1. Recuperiamo gli investimenti dal DB
    List<Investment> investments = investmentService.getUserPortfolio(userId);

    // 2. Creiamo la lista arricchita
    List<Map<String, Object>> portfolioWithPrices = new ArrayList<>();

    for (Investment inv : investments) {
      Map<String, Object> item = new HashMap<>();

      // Mettiamo i dati dell'investimento
      item.put("investment", inv);

      // Chiediamo il prezzo attuale all'API esterna
      double currentPrice = marketService.getCurrentPrice(inv.getSymbol());
      item.put("currentPrice", currentPrice);

      // Calcoliamo i guadagni
      double totalValue = currentPrice * inv.getQuantity();
      double gainLoss = totalValue - (inv.getBuyPrice() * inv.getQuantity());

      item.put("currentTotalValue", totalValue);
      item.put("gainLoss", gainLoss);

      portfolioWithPrices.add(item);
    }

    return ResponseEntity.ok(portfolioWithPrices);
  }
}
