package com.example.backend.controller;

import com.example.backend.entity.User;
import com.example.backend.repository.UserRepository;
import com.example.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:4200")
public class UserController {

  @Autowired
  private UserService userService;

  @Autowired
  private UserRepository userRepository;

  // --- API REGISTRAZIONE ---
  @PostMapping("/register")
  public ResponseEntity<?> register(@RequestBody User user) {
    if (userRepository.existsByUsername(user.getUsername())) {
      Map<String, String> errorResponse = new HashMap<>();
      errorResponse.put("field", "username");
      errorResponse.put("message", "Username già in uso");
      return ResponseEntity.status(HttpStatus.CONFLICT).body(errorResponse);
    }

    if (userRepository.existsByEmail(user.getEmail())) {
      Map<String, String> errorResponse = new HashMap<>();
      errorResponse.put("field", "email");
      errorResponse.put("message", "Email già registrata");
      return ResponseEntity.status(HttpStatus.CONFLICT).body(errorResponse);
    }

    try {
      User newUser = userService.registerUser(user);
      return ResponseEntity.ok(newUser);
    } catch (RuntimeException e) {
      return ResponseEntity.badRequest().body(e.getMessage());
    }
  }

  // --- API LOGIN ---
  @PostMapping("/login")
  public ResponseEntity<?> login(@RequestBody LoginRequest loginData) {
    User user = userService.loginUser(loginData.email, loginData.password);

    if (user != null) {
      return ResponseEntity.ok(user);
    } else {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Email o Password errati");
    }
  }

  // --- API GAMIFICATION (Stato Profilo) ---
  @GetMapping("/{id}/profile-status")
  public ResponseEntity<Map<String, Object>> getProfileStatus(@PathVariable Long id) {
    Optional<User> userOpt = userRepository.findById(id);

    if (userOpt.isPresent()) {
      User user = userOpt.get();
      int percentage = user.getProfileCompletion();

      Map<String, Object> response = new HashMap<>();
      response.put("userId", user.getId());
      response.put("completionPercentage", percentage);
      response.put("isComplete", percentage == 100);

      return ResponseEntity.ok(response);
    } else {
      return ResponseEntity.notFound().build();
    }
  }

  // DTO Login
  public static class LoginRequest {
    public String email;
    public String password;
  }

  // --- UPDATE PROFILO (CORRETTO QUI!) ---
  @PutMapping("/{id}/update")
  public ResponseEntity<?> updateProfile(@PathVariable Long id, @RequestBody User userDetails) {
    return userRepository.findById(id).map(user -> {
      // Aggiorniamo i campi
      if (userDetails.getNome() != null) user.setNome(userDetails.getNome());
      if (userDetails.getCognome() != null) user.setCognome(userDetails.getCognome());
      if (userDetails.getSesso() != null) user.setSesso(userDetails.getSesso());
      if (userDetails.getDataDiNascita() != null) user.setDataDiNascita(userDetails.getDataDiNascita());
      if (userDetails.getTelefono() != null) user.setTelefono(userDetails.getTelefono());
      if (userDetails.getIndirizzo() != null) user.setIndirizzo(userDetails.getIndirizzo());

      userRepository.save(user);

      // --- MODIFICA FONDAMENTALE ---
      // Invece di tornare una stringa semplice, torniamo un JSON!
      Map<String, String> response = new HashMap<>();
      response.put("message", "Profilo aggiornato con successo!");

      return ResponseEntity.ok(response);
      // -----------------------------

    }).orElse(ResponseEntity.notFound().build());
  }

  // Get User Details
  @GetMapping("/{id}")
  public ResponseEntity<User> getUserDetails(@PathVariable Long id) {
    return userRepository.findById(id)
      .map(user -> ResponseEntity.ok(user))
      .orElse(ResponseEntity.notFound().build());
  }
}
