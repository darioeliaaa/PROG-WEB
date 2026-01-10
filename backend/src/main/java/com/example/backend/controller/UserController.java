package com.example.backend.controller;

import com.example.backend.entity.User;
import com.example.backend.repository.UserRepository; // ✅ Import necessario
import com.example.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
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
  private UserRepository userRepository; // ✅ Iniettiamo il repository per cercare per ID

  // --- API REGISTRAZIONE ---
  @PostMapping("/register")
  public ResponseEntity<?> register(@RequestBody User user) {
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
      return ResponseEntity.status(401).body("Email o Password errati");
    }
  }

  // --- API GAMIFICATION (Stato Profilo) ---
  // GET http://localhost:8080/api/users/{id}/profile-status
  @GetMapping("/{id}/profile-status")
  public ResponseEntity<Map<String, Object>> getProfileStatus(@PathVariable Long id) {
    Optional<User> userOpt = userRepository.findById(id);

    if (userOpt.isPresent()) {
      User user = userOpt.get();
      // Chiama il metodo che hai aggiunto nell'Entity User
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

  // Classe di appoggio per ricevere i dati di login (DTO)
  public static class LoginRequest {
    public String email;
    public String password;
  }
  @PutMapping("/{id}/update")
  public ResponseEntity<?> updateProfile(@PathVariable Long id, @RequestBody User userDetails) {
    return userRepository.findById(id).map(user -> {
      // Aggiorniamo solo i campi anagrafici se sono presenti nel JSON
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

  // Nel file UserController.java

  @GetMapping("/{id}")
  public ResponseEntity<User> getUserDetails(@PathVariable Long id) {
    return userRepository.findById(id)
      .map(user -> ResponseEntity.ok(user))
      .orElse(ResponseEntity.notFound().build());
  }
}
