package com.example.backend.service;

import com.example.backend.entity.Transaction;
import com.example.backend.entity.TransactionType;
import com.example.backend.entity.User;
import com.example.backend.entity.Wallet;
import com.example.backend.repository.TransactionRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.repository.WalletRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;

@Service
public class WalletService {
  @Autowired
  private WalletRepository walletRepository;
  @Autowired private UserRepository userRepository;
  @Autowired private TransactionRepository transactionRepository;

  // Crea un nuovo wallet separato (Condiviso)
  @Transactional
  public Wallet createSharedWallet(Long userId, String name) {
    User user = userRepository.findById(userId).orElseThrow();
    Wallet wallet = new Wallet();
    wallet.setName(name);
    wallet.setPersonal(false);
    wallet.getMembers().add(user);
    user.getWallets().add(wallet);
    return walletRepository.save(wallet);
  }

  // LOGICA DI TRASFERIMENTO SOLDI
  @Transactional
  public void transferMoney(Long userId, Long fromWalletId, Long toWalletId, BigDecimal amount) {
    User user = userRepository.findById(userId).orElseThrow();
    Wallet fromWallet = walletRepository.findById(fromWalletId).orElseThrow();
    Wallet toWallet = walletRepository.findById(toWalletId).orElseThrow();

    // 1. Creiamo l'USCITA dal wallet sorgente
    Transaction out = new Transaction();
    out.setDescription("Spostamento verso " + toWallet.getName());
    out.setAmount(amount);
    out.setType(TransactionType.USCITA);
    out.setDate(LocalDate.now());
    out.setUser(user);
    out.setWallet(fromWallet);
    transactionRepository.save(out);

    // 2. Creiamo l'ENTRATA nel wallet destinazione
    Transaction in = new Transaction();
    in.setDescription("Ricevuto da " + fromWallet.getName());
    in.setAmount(amount);
    in.setType(TransactionType.ENTRATA);
    in.setDate(LocalDate.now());
    in.setUser(user);
    in.setWallet(toWallet);
    transactionRepository.save(in);
  }
  @Transactional
  public void inviteByUsername(Long walletId, String username) {
    Wallet wallet = walletRepository.findById(walletId).orElseThrow();
    User guest = userRepository.findByUsername(username)
      .orElseThrow(() -> new RuntimeException("Utente non trovato"));

    wallet.getMembers().add(guest);
    guest.getWallets().add(wallet);
    walletRepository.save(wallet);
  }
}
