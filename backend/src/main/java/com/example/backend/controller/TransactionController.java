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

  // GET: Legge i movimenti
  @GetMapping("/user/{userId}")
  public List<Transaction> getUserTransactions(@PathVariable Long userId) {
    return transactionService.getTransactionsByUserId(userId);
  }

  // POST: Aggiunge un movimento
  @PostMapping("/user/{userId}")
  public Transaction addTransaction(@PathVariable Long userId, @RequestBody Transaction transaction) {
    return transactionService.saveTransaction(userId, transaction);
  }
}
