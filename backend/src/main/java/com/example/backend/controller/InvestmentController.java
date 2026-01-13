package com.example.backend.controller;

import com.example.backend.dto.TradeRequestDTO;
import com.example.backend.service.InvestmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/investments")
@CrossOrigin(origins = "http://localhost:4200")
public class InvestmentController {

  @Autowired
  private InvestmentService investmentService;

  // ✅ MODIFICATO: Da "/buy" a "/trade" per gestire anche le vendite
  @PostMapping("/trade")
  public ResponseEntity<?> trade(@RequestBody TradeRequestDTO request) {
    try {
      System.out.println("--- RICEVUTA RICHIESTA TRADE ---");
      System.out.println("User ID: " + request.getUserId());
      System.out.println("Action: " + request.getAction());
      System.out.println("Symbol: " + request.getSymbol());

      investmentService.executeTrade(request);

      return ResponseEntity.ok("{\"message\": \"Operazione eseguita con successo!\"}");
    } catch (RuntimeException e) {
      // STAMPA L'ERRORE NEL TERMINALE
      System.err.println("❌ ERRORE TRADE: " + e.getMessage());
      e.printStackTrace();

      // RESTITUISCE IL MESSAGGIO AL FRONTEND
      return ResponseEntity.badRequest().body("{\"error\": \"" + e.getMessage() + "\"}");
    }
  }
}
