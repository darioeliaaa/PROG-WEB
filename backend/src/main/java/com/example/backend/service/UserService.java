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
import java.util.UUID; // ✅ Import necessario

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

  public User registerUser(User user) {
    if (userRepository.findByEmail(user.getEmail()).isPresent()) {
      throw new RuntimeException("Email già registrata!");
    }

    user.setPassword(passwordEncoder.encode(user.getPassword()));
    User savedUser = userRepository.save(user);

    Wallet personalWallet = new Wallet();
    personalWallet.setName("Mio Portafoglio");
    personalWallet.setPersonal(true);
    personalWallet.setActive(true);
    personalWallet.setMonthlyBudget(BigDecimal.ZERO);
    personalWallet.setAdmin(savedUser);
    personalWallet.getMembers().add(savedUser);

    walletRepository.save(personalWallet);
    savedUser.getWallets().add(personalWallet);

    return userRepository.save(savedUser);
  }

  public User loginUser(String email, String password) {
    Optional<User> userOptional = userRepository.findByEmail(email);

    if (userOptional.isPresent()) {
      User user = userOptional.get();
      if (passwordEncoder.matches(password, user.getPassword())) {
        System.out.println("Login effettuato: Restituisco UserProxy per ottimizzare le risorse.");
        return new UserProxy(user, transactionRepository);
      }
    }
    return null;
  }

  public User getUserByIdWithProxy(Long id) {
    User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("Utente non trovato"));
    return new UserProxy(user, transactionRepository);
  }

  // --- ✅ 1. INIZIA RESET PASSWORD (Genera Token) ---
  public String startPasswordReset(String email) {
    User user = userRepository.findByEmail(email)
      .orElseThrow(() -> new RuntimeException("Nessun utente trovato con questa email"));

    // Genera token semplice di 6 caratteri (es. A1B2C3)
    String token = UUID.randomUUID().toString().substring(0, 6).toUpperCase();

    user.setResetToken(token);
    userRepository.save(user);

    return token; // Lo restituiamo al controller per vederlo nel debug
  }

  // --- ✅ 2. COMPLETA RESET PASSWORD (Verifica e Cambia) ---
  public void completePasswordReset(String token, String newPassword) {
    User user = userRepository.findByResetToken(token)
      .orElseThrow(() -> new RuntimeException("Codice non valido o scaduto"));

    user.setPassword(passwordEncoder.encode(newPassword));
    user.setResetToken(null); // Cancella il token dopo l'uso
    userRepository.save(user);
  }
}
