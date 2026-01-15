package com.example.backend.controller;

import com.example.backend.entity.Transaction;
import com.example.backend.entity.TransactionType;
import com.example.backend.repository.TransactionRepository;
import com.example.backend.service.TransactionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/transactions")
@CrossOrigin(origins = "http://localhost:4200")
public class TransactionController {

  @Autowired
  private TransactionService transactionService;

  @Autowired
  private TransactionRepository transactionRepository;

  @GetMapping("/wallet/{walletId}")
  public List<Transaction> getTransactionsByWallet(@PathVariable Long walletId) {
    return transactionService.getTransactionsByWalletId(walletId);
  }

  // ✅ METODO DI SALVATAGGIO "BLINDATO"
  // Accetta una Map invece dell'Entity per evitare problemi con i Proxy
  @PostMapping("/user/{userId}/wallet/{walletId}")
  public ResponseEntity<?> addTransaction(
    @PathVariable Long userId,
    @PathVariable Long walletId,
    @RequestBody Map<String, Object> payload
  ) {
    try {
      // Creiamo la transazione manualmente dai dati del JSON
      Transaction t = new Transaction();
      t.setDescription((String) payload.get("description"));
      t.setCategory((String) payload.get("category"));

      // Gestione sicura dei numeri
      Object amountObj = payload.get("amount");
      t.setAmount(new BigDecimal(amountObj.toString()));

      // Gestione data (se arriva come stringa)
      if (payload.get("date") != null) {
        t.setDate(LocalDate.parse((String) payload.get("date")));
      } else {
        t.setDate(LocalDate.now());
      }

      // Gestione Enum Type
      String typeStr = (String) payload.get("type");
      t.setType(TransactionType.valueOf(typeStr));

      // Salviamo tramite il service
      Transaction saved = transactionService.saveTransaction(userId, walletId, t);
      return ResponseEntity.ok(saved);

    } catch (Exception e) {
      e.printStackTrace();
      return ResponseEntity.badRequest().body("Errore salvataggio: " + e.getMessage());
    }
  }

  @GetMapping("/recent/{userId}")
  public List<Transaction> getRecentTransactions(@PathVariable Long userId) {
    return transactionRepository.findByUserIdOrderByDateDesc(userId, PageRequest.of(0, 5));
  }
}
