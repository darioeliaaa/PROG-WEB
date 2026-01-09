package com.example.backend.controller;

import com.example.backend.entity.Transaction;
import com.example.backend.service.TransactionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/api/transactions")
@CrossOrigin(origins = "http://localhost:4200") // Lascia passare Angular
public class TransactionController {

  @Autowired
  private TransactionService transactionService;

  @GetMapping("/wallet/{walletId}")
  public List<Transaction> getTransactionsByWallet(@PathVariable Long walletId) {
    // Chiamiamo il metodo del service che filtra per Wallet
    return transactionService.getTransactionsByWalletId(walletId);
  }

  // POST: Aggiunge un movimento
  @PostMapping("/user/{userId}")
  public Transaction addTransaction(@PathVariable Long userId,@PathVariable Long walletId, @RequestBody Transaction transaction) {
    return transactionService.saveTransaction(userId, walletId, transaction);
  }
}
