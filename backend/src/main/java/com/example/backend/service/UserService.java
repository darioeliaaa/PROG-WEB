package com.example.backend.service;

import com.example.backend.entity.User;
import com.example.backend.entity.Wallet;
import com.example.backend.repository.UserRepository;
import com.example.backend.repository.WalletRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal; // <--- AGGIUNTO QUESTO IMPORT
import java.util.Optional;

@Service
public class UserService {

  @Autowired
  private UserRepository userRepository;

  @Autowired
  private WalletRepository walletRepository;

  @Autowired
  private PasswordEncoder passwordEncoder;

  // --- 1. REGISTRAZIONE ---
  public User registerUser(User user) {
    // Controllo se l'email esiste già
    if (userRepository.findByEmail(user.getEmail()).isPresent()) {
      throw new RuntimeException("Email già registrata!");
    }

    // CRIPTIAMO la password prima di salvarla nel DB
    user.setPassword(passwordEncoder.encode(user.getPassword()));

    // 1. Salviamo l'utente una prima volta per generare l'ID
    User savedUser = userRepository.save(user);

    // 2. Creiamo il Wallet Personale
    Wallet personalWallet = new Wallet();
    personalWallet.setName("Mio Portafoglio");
    personalWallet.setPersonal(true);
    personalWallet.setActive(true);                 // <--- IMPORTANTE: Lo attiviamo
    personalWallet.setMonthlyBudget(BigDecimal.ZERO); // <--- IMPORTANTE: Evitiamo null pointer

    // 3. Impostiamo l'Admin (l'utente stesso)
    personalWallet.setAdmin(savedUser);

    // 4. Colleghiamo i membri (Lato Wallet)
    personalWallet.getMembers().add(savedUser);

    // Salviamo il wallet per avere il suo ID
    walletRepository.save(personalWallet);

    // 5. CRUCIALE: Colleghiamo il wallet all'utente (Lato Utente - Proprietario)
    // Senza questa riga, la tabella user_wallets resta vuota!
    savedUser.getWallets().add(personalWallet);

    // 6. Risalviamo l'utente per scrivere la relazione nel DB
    return userRepository.save(savedUser);
  }

  // --- 2. LOGIN ---
  public User loginUser(String email, String password) {
    // Cerchiamo l'utente
    Optional<User> userOptional = userRepository.findByEmail(email);

    if (userOptional.isPresent()) {
      User user = userOptional.get();
      // Controllo password
      if (passwordEncoder.matches(password, user.getPassword())) {
        return user;
      }
    }

    return null; // Login fallito
  }
}
