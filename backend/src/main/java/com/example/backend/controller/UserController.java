package com.example.backend.controller;

import com.example.backend.entity.User;
import com.example.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:4200") // Permettiamo ad Angular di chiamarci
public class UserController {

  @Autowired
  private UserService userService;

  // --- API REGISTRAZIONE ---
  // POST http://localhost:8080/api/users/register
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
  // POST http://localhost:8080/api/users/login
  @PostMapping("/login")
  public ResponseEntity<?> login(@RequestBody LoginRequest loginData) {
    User user = userService.loginUser(loginData.email, loginData.password);

    if (user != null) {
      return ResponseEntity.ok(user);
    } else {
      return ResponseEntity.status(401).body("Email o Password errati");
    }
  }

  // Classe di appoggio per ricevere i dati di login (DTO)
  public static class LoginRequest {
    public String email;
    public String password;
  }
}
