package com.example.backend.controller;

import com.example.backend.entity.User;
import com.example.backend.entity.Wallet;
import com.example.backend.repository.UserRepository;
import com.example.backend.repository.WalletRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;

@RestController
public class TestController {

  @Autowired private WalletRepository walletRepository;
  @Autowired private UserRepository userRepository;

  @GetMapping("/test")
  public String test() {
    return "Backend Moneymind Funzionante! 🚀";
  }

  // Usa: http://localhost:8080/fix-money?userId=1&amount=50000
  @GetMapping("/fix-money")
  public String fixMoney(@RequestParam Long userId, @RequestParam int amount) {
    // 1. Trova l'utente
    User user = userRepository.findById(userId).orElse(null);
    if (user == null) return "❌ Errore: Utente ID " + userId + " non trovato.";

    // 2. Trova il suo wallet PERSONALE (quello usato per il trading)
    Wallet wallet = walletRepository.findByAdminAndPersonalTrue(user).orElse(null);

    if (wallet == null) return "❌ Errore: Questo utente non ha un wallet personale!";

    // 3. FORZA IL SALDO
    wallet.setMonthlyBudget(new BigDecimal(amount));
    walletRepository.save(wallet);

    return "✅ SUCCESSO! Il wallet di " + user.getUsername() + " (ID Wallet: " + wallet.getId() + ") ora ha " + amount + "€ REALI.";
  }
}
