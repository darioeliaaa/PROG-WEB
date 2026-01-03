package com.example.backend.service;

import com.example.backend.entity.Transaction;
import com.example.backend.entity.User;
import com.example.backend.repository.TransactionRepository;
import com.example.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TransactionService {

  @Autowired
  private TransactionRepository transactionRepository;

  @Autowired
  private UserRepository userRepository;

  // Prendi tutti i movimenti di un utente
  public List<Transaction> getTransactionsByUserId(Long userId) {
    return transactionRepository.findByUserId(userId);
  }

  // Salva un nuovo movimento
  public Transaction saveTransaction(Long userId, Transaction transaction) {
    User user = userRepository.findById(userId)
      .orElseThrow(() -> new RuntimeException("Utente non trovato!"));

    transaction.setUser(user);
    return transactionRepository.save(transaction);
  }
}
