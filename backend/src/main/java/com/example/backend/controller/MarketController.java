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

  // ✅ CORREZIONE 1: Aggiunto il parametro ?refresh=true/false
  // Questo permette al bottone "Aggiorna" di forzare il ricalcolo, altrimenti usa la Cache.
  @GetMapping("/overview")
  public ResponseEntity<List<AssetQuoteDTO>> getMarketOverview(@RequestParam(defaultValue = "false") boolean refresh) {
    // Passiamo il valore 'refresh' al Service
    return ResponseEntity.ok(marketService.getDashboardAssets(refresh));
  }

  // ✅ CORREZIONE 2: Usiamo i dati Intraday (15 minuti)
  // Abbiamo cambiato da getAssetHistory a getIntradayHistory per avere il grafico dettagliato
  @GetMapping("/history/{symbol}")
  public ResponseEntity<Map<String, Object>> getHistory(@PathVariable String symbol) {
    return ResponseEntity.ok(marketService.getIntradayHistory(symbol));
  }
}
