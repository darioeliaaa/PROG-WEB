package com.example.backend.controller;

import com.example.backend.entity.Transaction;
import com.example.backend.repository.TransactionRepository; // Assicurati di averlo o usare il Service
import com.example.backend.service.TransactionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest; // <--- IMPORTANTE
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@CrossOrigin(origins = "http://localhost:4200")
public class TransactionController {

  @Autowired
  private TransactionService transactionService;

  @Autowired
  private TransactionRepository transactionRepository; // Iniettiamo il repo per brevità (o aggiungilo al service)

  @GetMapping("/wallet/{walletId}")
  public List<Transaction> getTransactionsByWallet(@PathVariable Long walletId) {
    return transactionService.getTransactionsByWalletId(walletId);
  }

  @PostMapping("/user/{userId}/wallet/{walletId}")
  public Transaction addTransaction(@PathVariable Long userId,@PathVariable Long walletId, @RequestBody Transaction transaction) {
    return transactionService.saveTransaction(userId, walletId, transaction);
  }

  // ✅ NUOVO ENDPOINT: Ultime 5 transazioni dell'utente
  @GetMapping("/recent/{userId}")
  public List<Transaction> getRecentTransactions(@PathVariable Long userId) {
    // PageRequest.of(0, 5) = Pagina 0, Dimensione 5
    return transactionRepository.findByUserIdOrderByDateDesc(userId, PageRequest.of(0, 5));
  }
}
