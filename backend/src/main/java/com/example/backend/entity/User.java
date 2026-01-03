package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.util.List;

@Entity
@Data
@Table(name = "users") // "users" plurale per evitare conflitti con parole chiave SQL
public class User {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(unique = true, nullable = false)
  private String username;

  @Column(unique = true, nullable = false)
  private String email;

  private String password;

  // Opzionale: relazione inversa per vedere le transazioni dell'utente
  // @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
  // private List<Transaction> transactions;
}
