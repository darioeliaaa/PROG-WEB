package com.example.backend.repository;

import com.example.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
  // Spring crea automaticamente la query SQL per trovare un utente tramite email
  Optional<User> findByEmail(String email);
}
