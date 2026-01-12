package com.example.backend.repository;

import com.example.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
  // Metodi per trovare l'utente intero (già li avevi)
  Optional<User> findByEmail(String email);
  Optional<User> findByUsername(String username);

  // --- AGGIUNGI QUESTI DUE METODI BOOLEANI ---
  // Servono per il controllo preventivo nel Controller
  boolean existsByEmail(String email);
  boolean existsByUsername(String username);
}
