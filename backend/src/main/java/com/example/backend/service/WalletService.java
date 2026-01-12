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
import org.springframework.security.core.context.SecurityContextHolder;

import java.math.BigDecimal;
import java.time.LocalDate;

@Service
public class WalletService {
  @Autowired
  private final WalletRepository walletRepository;
  @Autowired private final UserRepository userRepository;
  @Autowired private TransactionRepository transactionRepository;

  public WalletService(WalletRepository walletRepository, UserRepository userRepository) {
    this.walletRepository = walletRepository;
    this.userRepository = userRepository;
  }

  // Crea un nuovo wallet separato (Condiviso)
  @Transactional
  public Wallet createSharedWallet(Long userId, String name) {
    User user = userRepository.findById(userId).orElseThrow();
    Wallet wallet = new Wallet();
    wallet.setName(name);
    wallet.setPersonal(false);
    wallet.setAdmin(user);
    wallet.getMembers().add(user);
    user.getWallets().add(wallet);
    return walletRepository.save(wallet);
  }
  // FUNZIONE ADMIN: Rimuovere un membro
  @Transactional
  public void removeMember(Long adminId, Long walletId, Long memberToRemoveId) {
    Wallet wallet = walletRepository.findById(walletId).orElseThrow();

    // Controllo sicurezza: solo l'admin può rimuovere persone
    if (!wallet.getAdmin().getId().equals(adminId)) {
      throw new RuntimeException("Non hai i permessi di Admin!");
    }

    User member = userRepository.findById(memberToRemoveId).orElseThrow();
    wallet.getMembers().remove(member);
    member.getWallets().remove(wallet);

    walletRepository.save(wallet);
  }
  // Imposta un budget mensile (Solo Admin)
  @Transactional
  public void setWalletBudget(Long adminId, Long walletId, BigDecimal budget) {
    Wallet wallet = walletRepository.findById(walletId).orElseThrow();

    if (!wallet.getAdmin().getId().equals(adminId)) {
      throw new RuntimeException("Solo l'admin può impostare il budget!");
    }

    wallet.setMonthlyBudget(budget);
    walletRepository.save(wallet);
  }

  // Attiva/Disattiva wallet (Solo Admin)
  @Transactional
  public void toggleWalletStatus(Long adminId, Long walletId, boolean status) {
    Wallet wallet = walletRepository.findById(walletId).orElseThrow();

    if (!wallet.getAdmin().getId().equals(adminId)) {
      throw new RuntimeException("Solo l'admin può cambiare lo stato del wallet!");
    }

    wallet.setActive(status);
    walletRepository.save(wallet);
  }

  // FUNZIONE ADMIN: Eliminare l'intero Wallet
  @Transactional
  public void deleteWallet(Long adminId, Long walletId) {
    Wallet wallet = walletRepository.findById(walletId).orElseThrow();

    if (!wallet.getAdmin().getId().equals(adminId)) {
      throw new RuntimeException("Solo l'admin può eliminare il wallet!");
    }

    // Se è il wallet personale, non si può eliminare!
    if (wallet.isPersonal()) {
      throw new RuntimeException("Non puoi eliminare il tuo wallet personale!");
    }

    walletRepository.delete(wallet);
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

  @Transactional
  public Wallet joinWallet(Long walletId, Long userId) {
    Wallet wallet = walletRepository.findById(walletId)
      .orElseThrow(() -> new RuntimeException("Wallet non trovato"));

    User user = userRepository.findById(userId)
      .orElseThrow(() -> new RuntimeException("Utente non trovato"));

    if (!wallet.getMembers().contains(user)) {
      wallet.getMembers().add(user);
    }

    Wallet savedWallet = walletRepository.save(wallet);
    System.out.println("Members after join: " + savedWallet.getMembers());

    return wallet;
  }


}
