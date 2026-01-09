package com.example.backend.service;

import com.example.backend.entity.Transaction;
import com.example.backend.entity.User;
import com.example.backend.entity.Wallet;
import com.example.backend.repository.TransactionRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.repository.WalletRepository;
import org.springframework.beans.factory.annotation.Autowired;
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

  // 1. SALVATAGGIO DI UNA NUOVA SPESA
  @Transactional
  public Transaction saveTransaction(Long userId, Long walletId, Transaction transaction) {
    // Recuperiamo l'utente che sta spendendo
    User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("Utente non trovato"));

    // Recuperiamo il wallet (Personale o Condiviso) da cui escono/entrano i soldi
    Wallet wallet = walletRepository.findById(walletId).orElseThrow(() -> new RuntimeException("Portafoglio non trovato"));

    if (!wallet.isActive()) {
      throw new RuntimeException("Questo portafoglio è stato congelato dall'admin. Impossibile aggiungere spese.");
    }


    // Colleghiamo i pezzi
    transaction.setUser(user);
    transaction.setWallet(wallet);

    return transactionRepository.save(transaction);
  }

  // 2. LETTURA DELLE SPESE DI UN DETERMINATO WALLET
  public List<Transaction> getTransactionsByWalletId(Long walletId) {
    return transactionRepository.findByWalletId(walletId);
  }

  // 3. ELIMINAZIONE
  @Transactional
  public void deleteTransaction(Long id) {
    transactionRepository.deleteById(id);
  }
}
