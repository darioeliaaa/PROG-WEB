package com.example.backend.controller;

import com.example.backend.dto.AssetQuoteDTO;
import com.example.backend.service.MarketService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/market")
@CrossOrigin(origins = "http://localhost:4200") // Permettiamo ad Angular di accedere
public class MarketController {

  @Autowired
  private MarketService marketService;

  // Chiama questo per riempire la Dashboard
  @GetMapping("/overview")
  public ResponseEntity<List<AssetQuoteDTO>> getMarketOverview() {
    return ResponseEntity.ok(marketService.getDashboardAssets());
  }

  // Chiama questo per i dettagli del grafico
  @GetMapping("/history/{symbol}")
  public ResponseEntity<Map<String, Object>> getHistory(@PathVariable String symbol) {
    return ResponseEntity.ok(marketService.getAssetHistory(symbol));
  }
}
