package com.example.backend.service;

import com.example.backend.entity.Transaction;
import com.example.backend.entity.User;
import com.example.backend.entity.Wallet;
import com.example.backend.repository.TransactionRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.repository.WalletRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class TransactionService {

  @Autowired
  private TransactionRepository transactionRepository;

  @Autowired
  private UserRepository userRepository;

  @Autowired
  private WalletRepository walletRepository;

  // 1. SALVATAGGIO
  @Transactional
  public Transaction saveTransaction(Long userId, Long walletId, Transaction transaction) {
    // Carichiamo l'utente REALE dal DB
    User user = userRepository.findById(userId)
      .orElseThrow(() -> new RuntimeException("Utente non trovato"));

    Wallet wallet = walletRepository.findById(walletId)
      .orElseThrow(() -> new RuntimeException("Portafoglio non trovato"));

    if (!wallet.isActive()) {
      throw new RuntimeException("Questo portafoglio è stato congelato. Impossibile aggiungere spese.");
    }

    // Colleghiamo le entità reali
    transaction.setUser(user);
    transaction.setWallet(wallet);

    return transactionRepository.save(transaction);
  }

  // 2. LETTURA PER WALLET
  public List<Transaction> getTransactionsByWalletId(Long walletId) {
    return transactionRepository.findByWalletId(walletId);
  }

  // 3. ULTIMI MOVIMENTI
  public List<Transaction> getRecentTransactions(Long userId) {
    return transactionRepository.findByUserIdOrderByDateDesc(userId, PageRequest.of(0, 5));
  }

  // 4. ELIMINAZIONE
  @Transactional
  public void deleteTransaction(Long id) {
    transactionRepository.deleteById(id);
  }
}
