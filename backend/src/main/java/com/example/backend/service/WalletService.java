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
import java.util.HashSet;
import java.util.List;
import java.util.Random;
import java.util.Set;

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
    Wallet wallet = walletRepository.findById(walletId)
      .orElseThrow(() -> new RuntimeException("Wallet non trovato"));

    if (!wallet.getAdmin().getId().equals(adminId)) {
      throw new RuntimeException("Non hai i permessi di Admin!");
    }

    // Controlliamo solo che non si stia rimuovendo l'admin stesso (opzionale, ma buona prassi)
    if(wallet.getAdmin().getId().equals(memberToRemoveId)){
      throw new RuntimeException("L'admin non può essere rimosso, deve eliminare il wallet.");
    }

    // 1. Rimuovi la riga dalla tabella di collegamento - VIA SQL
    walletRepository.detachMember(walletId, memberToRemoveId);
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
    Wallet wallet = walletRepository.findById(walletId)
      .orElseThrow(() -> new RuntimeException("Wallet non trovato"));

    if (!wallet.getAdmin().getId().equals(adminId)) {
      throw new RuntimeException("Solo l'admin può eliminare il wallet!");
    }
    if (wallet.isPersonal()) {
      throw new RuntimeException("Non puoi eliminare il tuo wallet personale!");
    }

    // 1. Elimina le transazioni (Vincolo chiave esterna)
    transactionRepository.deleteByWalletId(walletId);

    // 2. Scollega tutti i membri (Pulisce user_wallets) - VIA SQL
    walletRepository.detachAllMembers(walletId);

    // 3. Elimina il wallet definitivamente
    walletRepository.delete(wallet);
  }

  @Transactional
  public void transferMoney(Long userId, Long fromWalletId, Long toWalletId, BigDecimal amount) {
    if (amount.compareTo(BigDecimal.ZERO) <= 0) {
      throw new RuntimeException("L'importo deve essere positivo");
    }

    Wallet fromWallet = walletRepository.findById(fromWalletId)
      .orElseThrow(() -> new RuntimeException("Wallet di origine non trovato"));

    Wallet toWallet = walletRepository.findById(toWalletId)
      .orElseThrow(() -> new RuntimeException("Wallet di destinazione non trovato"));

    // 1. CALCOLO SALDO DEL MITTENTE
    // Sommiamo tutte le entrate e sottraiamo le uscite per vedere quanto ha davvero
    BigDecimal currentBalance = transactionRepository.findByWallet(fromWallet).stream()
      .map(t -> t.getType() == TransactionType.ENTRATA ? t.getAmount() : t.getAmount().negate())
      .reduce(BigDecimal.ZERO, BigDecimal::add);

    // 2. CONTROLLO FONDI
    // Se il saldo è minore dell'importo che vuoi trasferire -> BLOCCA TUTTO
    if (currentBalance.compareTo(amount) < 0) {
      throw new RuntimeException("Fondi insufficienti nel wallet di origine! Saldo attuale: " + currentBalance + " €");
    }

    // 3. ESECUZIONE TRASFERIMENTO
    User user = userRepository.findById(userId)
      .orElseThrow(() -> new RuntimeException("Utente non trovato"));

    // Uscita dal mittente
    Transaction out = new Transaction();
    out.setDescription("Trasferimento a " + toWallet.getName());
    out.setAmount(amount);
    out.setType(TransactionType.USCITA);
    out.setDate(LocalDate.now());
    out.setUser(user);
    out.setWallet(fromWallet);
    out.setCategory("trasferimento"); // Categoria tecnica
    transactionRepository.save(out);

    // Entrata nel destinatario
    Transaction in = new Transaction();
    in.setDescription("Ricevuto da " + fromWallet.getName()); // O "da Mio Portafoglio"
    in.setAmount(amount);
    in.setType(TransactionType.ENTRATA);
    in.setDate(LocalDate.now());
    in.setUser(user);
    in.setWallet(toWallet);
    in.setCategory("trasferimento");
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

  @Transactional
  public void updateWalletLimits(Long adminId, Long walletId, BigDecimal budget, BigDecimal maxTransfer) {
    Wallet wallet = walletRepository.findById(walletId)
      .orElseThrow(() -> new RuntimeException("Wallet non trovato"));

    if (!wallet.getAdmin().getId().equals(adminId)) {
      throw new RuntimeException("Solo l'admin può modificare i limiti!");
    }

    wallet.setMonthlyBudget(budget);
    wallet.setMaxTransferLimit(maxTransfer); // ✅ Salviamo il nuovo limite
    walletRepository.save(wallet);
  }

  @Transactional
  public void openWallet(Long walletId, String newName) {
    Wallet wallet = walletRepository.findById(walletId)
      .orElseThrow(() -> new RuntimeException("Wallet non trovato"));
  }

  public List<Wallet> findWalletsByUserId(Long userId) {
    return walletRepository.findAllByMembers_Id(userId);
  }
}
