package com.example.backend.service;

import com.example.backend.entity.User;
import com.example.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {

  @Autowired
  private UserRepository userRepository;

  @Autowired
  private PasswordEncoder passwordEncoder;

  // --- 1. REGISTRAZIONE ---
  public User registerUser(User user) {
    // Controllo se l'email esiste già
    if (userRepository.findByEmail(user.getEmail()).isPresent()) {
      throw new RuntimeException("Email già registrata!");
    }
    // CRIPTIAMO la password prima di salvarla nel DB
    String passwordCriptata = passwordEncoder.encode(user.getPassword());
    user.setPassword(passwordCriptata);
    // Salviamo l'utente (in un progetto reale qui cripteremmo la password)
    return userRepository.save(user);
  }

  // --- 2. LOGIN ---
  public User loginUser(String email, String password) {
    // Cerchiamo l'utente
    Optional<User> userOptional = userRepository.findByEmail(email);

    if (userOptional.isPresent()) {
      User user = userOptional.get();
      // Controllo password (semplice confronto stringhe per ora)
      if (passwordEncoder.matches(password, user.getPassword())) {
        return user;
      }
    }

    return null; // Login fallito (utente non trovato o password errata)
  }
}
