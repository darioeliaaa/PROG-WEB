package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.util.HashSet;
import java.util.Set;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Data
@Table(name = "wallets")
public class Wallet {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  private String name;

  // Campo fondamentale per la tua logica
  private boolean personal = false;

  @ManyToMany(mappedBy = "wallets")
  @JsonIgnoreProperties("wallets")
  private Set<User> members = new HashSet<>();
}
