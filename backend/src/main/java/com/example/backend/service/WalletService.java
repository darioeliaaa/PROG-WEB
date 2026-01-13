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
import java.util.List;
import java.util.Random;

@Service
public class WalletService {

  @Autowired
  private final WalletRepository walletRepository;
  @Autowired
  private final UserRepository userRepository;
  @Autowired
  private TransactionRepository transactionRepository;

  public WalletService(WalletRepository walletRepository, UserRepository userRepository) {
    this.walletRepository = walletRepository;
    this.userRepository = userRepository;
  }

  // --- 1. CREAZIONE WALLET (Con Generazione Codice) ---
  @Transactional
  public Wallet createSharedWallet(Long userId, String name) {
    User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("Utente non trovato"));

    Wallet wallet = new Wallet();
    wallet.setName(name);
    wallet.setPersonal(false);
    wallet.setAdmin(user);
    wallet.setInviteCode(generateUniqueInviteCode());

    // 1. Salviamo PRIMA il wallet per assicurarci che abbia un ID e esista nel DB
    wallet = walletRepository.save(wallet);

    // 2. Aggiorniamo le relazioni in memoria
    wallet.getMembers().add(user);
    user.getWallets().add(wallet);

    // 3. PASSAGGIO CRUCIALE MANCANTE:
    // Poiché User è il "proprietario" della relazione (@JoinTable è su User),
    // dobbiamo salvare l'utente per scrivere la riga nella tabella ponte 'user_wallets'.
    userRepository.save(user);

    return wallet;
  }

  // --- 2. JOIN WALLET TRAMITE CODICE (Nuovo Metodo) ---
  @Transactional
  public Wallet joinWalletByCode(String inviteCode, Long userId) {
    // 1. Trova il wallet e l'utente
    Wallet wallet = walletRepository.findByInviteCode(inviteCode)
      .orElseThrow(() -> new RuntimeException("Codice invito non valido!"));

    User user = userRepository.findById(userId)
      .orElseThrow(() -> new RuntimeException("Utente non trovato"));

    // 2. Controllo manuale per evitare duplicati (più sicuro del .contains)
    boolean isAlreadyMember = wallet.getMembers().stream()
      .anyMatch(m -> m.getId().equals(userId));

    if (isAlreadyMember) {
      throw new RuntimeException("Sei già membro di questo wallet!");
    }

    // 3. Aggiungi la relazione
    wallet.getMembers().add(user);
    user.getWallets().add(wallet);

    // 4. Salva l'utente (proprietario della relazione)
    userRepository.save(user);

    return wallet;
  }

  // --- 3. ✅ METODO AGGIUNTO: JOIN TRAMITE ID (Legacy) ---
  // Questo è quello che il Controller stava cercando e non trovava!
  @Transactional
  public Wallet joinWallet(Long walletId, Long userId) {
    Wallet wallet = walletRepository.findById(walletId)
      .orElseThrow(() -> new RuntimeException("Wallet non trovato"));

    User user = userRepository.findById(userId)
      .orElseThrow(() -> new RuntimeException("Utente non trovato"));

    if (!user.getWallets().contains(wallet)) {
      user.getWallets().add(wallet);
      wallet.getMembers().add(user);
      userRepository.save(user); // Importante salvare l'utente
    }
    return wallet;
  }


  // --- UTILITY ---
  private String generateUniqueInviteCode() {
    String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    StringBuilder code = new StringBuilder();
    Random rnd = new Random();

    while (true) {
      code.setLength(0);
      for (int i = 0; i < 6; i++) {
        code.append(chars.charAt(rnd.nextInt(chars.length())));
      }
      String generated = code.toString();
      if (!walletRepository.existsByInviteCode(generated)) {
        return generated;
      }
    }
  }

  // --- ALTRE FUNZIONI ESISTENTI ---

  @Transactional
  public void removeMember(Long adminId, Long walletId, Long memberToRemoveId) {
    Wallet wallet = walletRepository.findById(walletId).orElseThrow();
    if (!wallet.getAdmin().getId().equals(adminId)) {
      throw new RuntimeException("Non hai i permessi di Admin!");
    }
    User member = userRepository.findById(memberToRemoveId).orElseThrow();
    wallet.getMembers().remove(member);
    member.getWallets().remove(wallet);
    walletRepository.save(wallet);
    userRepository.save(member);
  }

  @Transactional
  public void setWalletBudget(Long adminId, Long walletId, BigDecimal budget) {
    Wallet wallet = walletRepository.findById(walletId).orElseThrow();
    if (!wallet.getAdmin().getId().equals(adminId)) {
      throw new RuntimeException("Solo l'admin può impostare il budget!");
    }
    wallet.setMonthlyBudget(budget);
    walletRepository.save(wallet);
  }

  @Transactional
  public void toggleWalletStatus(Long adminId, Long walletId, boolean status) {
    Wallet wallet = walletRepository.findById(walletId).orElseThrow();
    if (!wallet.getAdmin().getId().equals(adminId)) {
      throw new RuntimeException("Solo l'admin può cambiare lo stato del wallet!");
    }
    wallet.setActive(status);
    walletRepository.save(wallet);
  }

  @Transactional
  public void deleteWallet(Long adminId, Long walletId) {
    Wallet wallet = walletRepository.findById(walletId).orElseThrow();
    if (!wallet.getAdmin().getId().equals(adminId)) {
      throw new RuntimeException("Solo l'admin può eliminare il wallet!");
    }
    if (wallet.isPersonal()) {
      throw new RuntimeException("Non puoi eliminare il tuo wallet personale!");
    }
    walletRepository.delete(wallet);
  }

  @Transactional
  public void transferMoney(Long userId, Long fromWalletId, Long toWalletId, BigDecimal amount) {
    User user = userRepository.findById(userId).orElseThrow();
    Wallet fromWallet = walletRepository.findById(fromWalletId).orElseThrow();
    Wallet toWallet = walletRepository.findById(toWalletId).orElseThrow();

    Transaction out = new Transaction();
    out.setDescription("Spostamento verso " + toWallet.getName());
    out.setAmount(amount);
    out.setType(TransactionType.USCITA);
    out.setDate(LocalDate.now());
    out.setUser(user);
    out.setWallet(fromWallet);
    transactionRepository.save(out);

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

    if (!guest.getWallets().contains(wallet)) {
      wallet.getMembers().add(guest);
      guest.getWallets().add(wallet);
      userRepository.save(guest);
    }
  }

  public List<Wallet> findWalletsByUserId(Long userId) {
    return walletRepository.findAllByMembers_Id(userId);
  }
}
