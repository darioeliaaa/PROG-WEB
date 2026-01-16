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

  @Transactional
  public Wallet createSharedWallet(Long userId, String name) {
    User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("Utente non trovato"));
    Wallet wallet = new Wallet();
    wallet.setName(name);
    wallet.setPersonal(false);
    wallet.setAdmin(user);
    wallet.setInviteCode(generateUniqueInviteCode());
    wallet = walletRepository.save(wallet);
    wallet.getMembers().add(user);
    user.getWallets().add(wallet);
    userRepository.save(user);
    return wallet;
  }

  @Transactional
  public Wallet joinWalletByCode(String inviteCode, Long userId) {
    Wallet wallet = walletRepository.findByInviteCode(inviteCode)
      .orElseThrow(() -> new RuntimeException("Codice invito non valido!"));
    User user = userRepository.findById(userId)
      .orElseThrow(() -> new RuntimeException("Utente non trovato"));

    boolean isAlreadyMember = wallet.getMembers().stream()
      .anyMatch(m -> m.getId().equals(userId));

    if (isAlreadyMember) {
      throw new RuntimeException("Sei già membro di questo wallet!");
    }

    wallet.getMembers().add(user);
    user.getWallets().add(wallet);
    userRepository.save(user);
    return wallet;
  }

  @Transactional
  public Wallet joinWallet(Long walletId, Long userId) {
    Wallet wallet = walletRepository.findById(walletId)
      .orElseThrow(() -> new RuntimeException("Wallet non trovato"));
    User user = userRepository.findById(userId)
      .orElseThrow(() -> new RuntimeException("Utente non trovato"));

    if (!user.getWallets().contains(wallet)) {
      user.getWallets().add(wallet);
      wallet.getMembers().add(user);
      userRepository.save(user);
    }
    return wallet;
  }

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

  @Transactional
  public void removeMember(Long requesterId, Long walletId, Long memberToRemoveId) {
    Wallet wallet = walletRepository.findById(walletId)
      .orElseThrow(() -> new RuntimeException("Wallet non trovato"));
    if (wallet.getAdmin().getId().equals(memberToRemoveId)) {
      throw new RuntimeException("L'admin non può abbandonare il wallet.");
    }
    boolean isAdmin = wallet.getAdmin().getId().equals(requesterId);
    boolean isSelfRemoval = requesterId.equals(memberToRemoveId);
    if (!isAdmin && !isSelfRemoval) {
      throw new RuntimeException("Non hai i permessi per rimuovere questo utente!");
    }
    walletRepository.detachMember(walletId, memberToRemoveId);
  }

  @Transactional
  public void setWalletBudget(Long adminId, Long walletId, BigDecimal budget) {
    Wallet wallet = walletRepository.findById(walletId).orElseThrow();
    if (!wallet.getAdmin().getId().equals(adminId)) throw new RuntimeException("Solo admin!");
    wallet.setMonthlyBudget(budget);
    walletRepository.save(wallet);
  }

  @Transactional
  public void toggleWalletStatus(Long adminId, Long walletId, boolean status) {
    Wallet wallet = walletRepository.findById(walletId).orElseThrow();
    if (!wallet.getAdmin().getId().equals(adminId)) throw new RuntimeException("Solo admin!");
    wallet.setActive(status);
    walletRepository.save(wallet);
  }

  @Transactional
  public void deleteWallet(Long adminId, Long walletId) {
    Wallet wallet = walletRepository.findById(walletId).orElseThrow(() -> new RuntimeException("Wallet non trovato"));
    if (!wallet.getAdmin().getId().equals(adminId)) throw new RuntimeException("Solo admin!");
    if (wallet.isPersonal()) throw new RuntimeException("Non puoi eliminare il wallet personale!");
    transactionRepository.deleteByWalletId(walletId);
    walletRepository.detachAllMembers(walletId);
    walletRepository.delete(wallet);
  }

  @Transactional
  public void transferMoney(Long userId, Long fromWalletId, Long toWalletId, BigDecimal amount) {
    if (amount.compareTo(BigDecimal.ZERO) <= 0) throw new RuntimeException("Importo positivo richiesto");
    Wallet fromWallet = walletRepository.findById(fromWalletId).orElseThrow(() -> new RuntimeException("Wallet origine assente"));
    Wallet toWallet = walletRepository.findById(toWalletId).orElseThrow(() -> new RuntimeException("Wallet destinazione assente"));

    BigDecimal currentBalance = transactionRepository.findByWallet(fromWallet).stream()
      .map(t -> t.getType() == TransactionType.ENTRATA ? t.getAmount() : t.getAmount().negate())
      .reduce(BigDecimal.ZERO, BigDecimal::add);

    if (currentBalance.compareTo(amount) < 0) throw new RuntimeException("Fondi insufficienti!");

    User user = userRepository.findById(userId).orElseThrow();

    Transaction out = new Transaction();
    out.setDescription("Trasferimento a " + toWallet.getName());
    out.setAmount(amount);
    out.setType(TransactionType.USCITA);
    out.setDate(LocalDate.now());
    out.setUser(user);
    out.setWallet(fromWallet);
    out.setCategory("trasferimento");
    transactionRepository.save(out);

    Transaction in = new Transaction();
    in.setDescription("Ricevuto da " + fromWallet.getName());
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
    User guest = userRepository.findByUsername(username).orElseThrow(() -> new RuntimeException("Utente non trovato"));
    if (!guest.getWallets().contains(wallet)) {
      wallet.getMembers().add(guest);
      guest.getWallets().add(wallet);
      userRepository.save(guest);
    }
  }

  @Transactional
  public void updateWalletLimits(Long adminId, Long walletId, BigDecimal budget, BigDecimal maxTransfer) {
    Wallet wallet = walletRepository.findById(walletId).orElseThrow();
    if (!wallet.getAdmin().getId().equals(adminId)) throw new RuntimeException("Solo admin!");
    wallet.setMonthlyBudget(budget);
    wallet.setMaxTransferLimit(maxTransfer);
    walletRepository.save(wallet);
  }

  @Transactional
  public void openWallet(Long walletId, String newName) {
    walletRepository.findById(walletId).orElseThrow();
  }

  public List<Wallet> findWalletsByUserId(Long userId) {
    return walletRepository.findAllByMembers_Id(userId);
  }

  @Transactional
  public void transferOwnership(Long walletId, Long currentAdminId, Long newAdminId) {
    Wallet wallet = walletRepository.findById(walletId)
      .orElseThrow(() -> new RuntimeException("Wallet non trovato"));

    if (!wallet.getAdmin().getId().equals(currentAdminId)) {
      throw new RuntimeException("Non hai i permessi!");
    }

    User newAdmin = userRepository.findById(newAdminId)
      .orElseThrow(() -> new RuntimeException("Nuovo admin non trovato"));

    boolean isMember = wallet.getMembers().stream()
      .anyMatch(member -> member.getId().equals(newAdminId));

    if (!isMember) {
      throw new RuntimeException("L'utente non è membro del wallet");
    }

    wallet.setAdmin(newAdmin);
    walletRepository.saveAndFlush(wallet);
  }
}
