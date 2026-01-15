package com.example.backend.service;

import com.example.backend.entity.User;
import com.example.backend.entity.Wallet;
// IMPORTA IL PROXY CHE ABBIAMO CREATO
import com.example.backend.proxy.UserProxy;
import com.example.backend.repository.TransactionRepository; // <--- Serve al Proxy
import com.example.backend.repository.UserRepository;
import com.example.backend.repository.WalletRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Optional;

@Service
public class UserService {

  @Autowired
  private UserRepository userRepository;

  @Autowired
  private WalletRepository walletRepository;

  // AGGIUNTA FONDAMENTALE: Il proxy ha bisogno di questo per caricare i dati "Lazy"
  @Autowired
  private TransactionRepository transactionRepository;

  @Autowired
  private PasswordEncoder passwordEncoder;

  // --- 1. REGISTRAZIONE ---
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

  // --- 2. LOGIN CON PROXY (Il pezzo forte per l'esame) ---
  public User loginUser(String email, String password) {
    Optional<User> userOptional = userRepository.findByEmail(email);

    if (userOptional.isPresent()) {
      User user = userOptional.get();

      if (passwordEncoder.matches(password, user.getPassword())) {

        // --- MODIFICA PER L'ESAME ---
        // Invece di tornare 'user' (che caricherebbe tutto subito o userebbe Hibernate),
        // torniamo il NOSTRO PROXY MANUALE.

        System.out.println("Login effettuato: Restituisco UserProxy per ottimizzare le risorse.");

        // Passiamo l'utente base + il repository al Proxy
        return new UserProxy(user, transactionRepository);
      }
    }

    return null;
  }

  // METODO EXTRA: Se ti serve recuperare l'utente per ID (es. nel profilo)
  public User getUserByIdWithProxy(Long id) {
    User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("Utente non trovato"));
    return new UserProxy(user, transactionRepository);
  }
}
