package com.example.backend.service;

import com.example.backend.entity.Transaction;
import com.example.backend.entity.User;
import com.example.backend.entity.Wallet;
import com.example.backend.repository.TransactionRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.repository.WalletRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest; // <--- AGGIUNTO PER LA PAGINAZIONE
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
    User user = userRepository.findById(userId)
      .orElseThrow(() -> new RuntimeException("Utente non trovato"));

    Wallet wallet = walletRepository.findById(walletId)
      .orElseThrow(() -> new RuntimeException("Portafoglio non trovato"));

    if (!wallet.isActive()) {
      throw new RuntimeException("Questo portafoglio è stato congelato dall'admin. Impossibile aggiungere spese.");
    }

    transaction.setUser(user);
    transaction.setWallet(wallet);

    return transactionRepository.save(transaction);
  }

  // 2. LETTURA DELLE SPESE DI UN WALLET (Per i Grafici)
  public List<Transaction> getTransactionsByWalletId(Long walletId) {
    return transactionRepository.findByWalletId(walletId);
  }

  // 3. ✅ METODO MANCANTE: ULTIMI MOVIMENTI (Per la Dashboard)
  // Restituisce le ultime 5 transazioni dell'utente
  public List<Transaction> getRecentTransactions(Long userId) {
    // Chiede al repository le transazioni ordinate per data, prendendone solo 5
    return transactionRepository.findByUserIdOrderByDateDesc(userId, PageRequest.of(0, 5));
  }

  // 4. ELIMINAZIONE
  @Transactional
  public void deleteTransaction(Long id) {
    transactionRepository.deleteById(id);
  }
}
