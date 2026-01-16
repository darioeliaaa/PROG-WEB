package com.example.backend.service;

import com.example.backend.entity.User;
import com.example.backend.entity.Wallet;
import com.example.backend.proxy.UserProxy;
import com.example.backend.repository.TransactionRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.repository.WalletRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

@Service
public class UserService {

  @Autowired
  private UserRepository userRepository;

  @Autowired
  private WalletRepository walletRepository;

  @Autowired
  private TransactionRepository transactionRepository;

  @Autowired
  private PasswordEncoder passwordEncoder;

  // --- 1. REGISTRAZIONE (Genera il Codice di Recupero) ---
  public User registerUser(User user) {
    if (userRepository.findByEmail(user.getEmail()).isPresent()) {
      throw new RuntimeException("Email già registrata!");
    }

    user.setPassword(passwordEncoder.encode(user.getPassword()));

    // ✅ QUI GENERIAMO IL CODICE DI RECUPERO (es. "A1B2C3")
    // Questo codice viene salvato nel DB e non cambierà (a meno che tu non voglia).
    user.setResetToken(generateResetToken());

    User savedUser = userRepository.save(user);

    // Creazione Wallet Personale
    Wallet personalWallet = new Wallet();
    personalWallet.setName("Mio Portafoglio");
    personalWallet.setPersonal(true);
    personalWallet.setActive(true);
    personalWallet.setMonthlyBudget(BigDecimal.ZERO);
    personalWallet.setAdmin(savedUser);
    personalWallet.getMembers().add(savedUser);
    personalWallet.setInviteCode(UUID.randomUUID().toString().substring(0, 6).toUpperCase());

    walletRepository.save(personalWallet);
    savedUser.getWallets().add(personalWallet);

    return userRepository.save(savedUser);
  }

  // --- 2. LOGIN ---
  public User loginUser(String email, String password) {
    Optional<User> userOptional = userRepository.findByEmail(email);
    if (userOptional.isPresent()) {
      User user = userOptional.get();
      if (passwordEncoder.matches(password, user.getPassword())) {
        return new UserProxy(user, transactionRepository);
      }
    }
    return null;
  }

  // --- 3. GET USER ---
  public User getUserByIdWithProxy(Long id) {
    User user = userRepository.findById(id)
      .orElseThrow(() -> new RuntimeException("Utente non trovato"));

    // ✅ FIX: Se l'utente è vecchio e non ha il token, generalo ORA.
    if (user.getResetToken() == null || user.getResetToken().isEmpty()) {
      user.setResetToken(generateResetToken());
      userRepository.save(user); // Salviamo subito nel DB
    }

    return new UserProxy(user, transactionRepository);
  }

  // --- 4. RESET PASSWORD CON CODICE DI RECUPERO ---
  // Non serve più "startPasswordReset" perché il codice esiste già dalla registrazione.

  public void resetPasswordWithRecoveryCode(String email, String recoveryCode, String newPassword) {
    // A. Cerchiamo l'utente tramite email
    User user = userRepository.findByEmail(email)
      .orElseThrow(() -> new RuntimeException("Nessun utente trovato con questa email."));

    // B. Controlliamo se il codice inserito corrisponde a quello nel DB
    String dbToken = user.getResetToken();

    if (dbToken == null || !dbToken.equalsIgnoreCase(recoveryCode.trim())) {
      throw new RuntimeException("Il codice di recupero non è corretto.");
    }

    // C. Se è giusto, aggiorniamo la password
    user.setPassword(passwordEncoder.encode(newPassword));

    // NOTA: NON cancelliamo il resetToken (user.setResetToken(null))
    // così l'utente può riutilizzare lo stesso codice in futuro se dimentica di nuovo la password.

    userRepository.save(user);
  }

  // --- HELPER ---
  private String generateResetToken() {
    return UUID.randomUUID().toString().substring(0, 6).toUpperCase();
  }
}
