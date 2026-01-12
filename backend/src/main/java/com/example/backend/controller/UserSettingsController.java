package com.example.backend.controller;

import com.example.backend.entity.User;
import com.example.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/settings")
@CrossOrigin(origins = "http://localhost:4200")
public class UserSettingsController {

  @Autowired
  private UserRepository userRepository;

  @GetMapping("/{userId}")
  public ResponseEntity<?> getSettings(@PathVariable Long userId) {
    Optional<User> userOpt = userRepository.findById(userId);

    if (userOpt.isPresent()) {
      User user = userOpt.get();
      Map<String, Object> settings = new HashMap<>();
      settings.put("language", user.getLanguage());
      settings.put("currency", user.getCurrency());
      settings.put("privacyMode", user.isPrivacyMode());
      settings.put("budgetAlerts", user.isBudgetAlerts());

      return ResponseEntity.ok(settings);
    } else {
      return ResponseEntity.status(404).body("Utente non trovato");
    }
  }

  @PutMapping("/{userId}")
  public ResponseEntity<?> updateSettings(@PathVariable Long userId, @RequestBody Map<String, Object> settings) {
    return userRepository.findById(userId)
      .map(user -> {
        System.out.println("Ricevuto dal frontend: " + settings);

        if(settings.containsKey("language")) user.setLanguage((String) settings.get("language"));
        if(settings.containsKey("currency")) user.setCurrency((String) settings.get("currency"));

        // Conversione sicura: funziona sia se arriva booleano, sia se arriva stringa
        user.setPrivacyMode(Boolean.parseBoolean(String.valueOf(settings.get("privacyMode"))));
        user.setBudgetAlerts(Boolean.parseBoolean(String.valueOf(settings.get("budgetAlerts"))));

        userRepository.save(user);
        return ResponseEntity.ok().build();
      })
      .orElse(ResponseEntity.notFound().build());
  }
}
