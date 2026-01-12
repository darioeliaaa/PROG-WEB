package com.example.backend.controller;

import com.example.backend.entity.User;
import com.example.backend.repository.UserRepository;
import com.example.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus; // Importante per lo status 409
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

  // --- API REGISTRAZIONE (MODIFICATA PER GESTIONE ERRORI SMART) ---
  @PostMapping("/register")
  public ResponseEntity<?> register(@RequestBody User user) {

    // 1. CONTROLLO USERNAME DUPLICATO
    if (userRepository.existsByUsername(user.getUsername())) {
      Map<String, String> errorResponse = new HashMap<>();
      errorResponse.put("field", "username"); // Angular leggerà questo campo!
      errorResponse.put("message", "Username già in uso");
      // Restituiamo errore 409 Conflict
      return ResponseEntity.status(HttpStatus.CONFLICT).body(errorResponse);
    }

    // 2. CONTROLLO EMAIL DUPLICATA
    if (userRepository.existsByEmail(user.getEmail())) {
      Map<String, String> errorResponse = new HashMap<>();
      errorResponse.put("field", "email"); // Angular leggerà questo campo!
      errorResponse.put("message", "Email già registrata");
      return ResponseEntity.status(HttpStatus.CONFLICT).body(errorResponse);
    }

    // 3. SE TUTTO OK, PROCEDI
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
      // Meglio tornare 401 Unauthorized per login fallito
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

  // Update Profilo
  @PutMapping("/{id}/update")
  public ResponseEntity<?> updateProfile(@PathVariable Long id, @RequestBody User userDetails) {
    return userRepository.findById(id).map(user -> {
      if (userDetails.getNome() != null) user.setNome(userDetails.getNome());
      if (userDetails.getCognome() != null) user.setCognome(userDetails.getCognome());
      if (userDetails.getSesso() != null) user.setSesso(userDetails.getSesso());
      if (userDetails.getDataDiNascita() != null) user.setDataDiNascita(userDetails.getDataDiNascita());
      if (userDetails.getTelefono() != null) user.setTelefono(userDetails.getTelefono());
      if (userDetails.getIndirizzo() != null) user.setIndirizzo(userDetails.getIndirizzo());

      userRepository.save(user);
      return ResponseEntity.ok("Profilo aggiornato con successo!");
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
