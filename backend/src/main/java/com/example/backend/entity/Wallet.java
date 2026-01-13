package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.util.HashSet;
import java.util.Set;
import java.math.BigDecimal;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Data
@Table(name = "wallets")
public class Wallet {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  private String name;

  // ✅ NUOVO CAMPO: Codice Invito (Es: "X9B2K1")
  // unique = true: Garantisce che non esistano due codici uguali nel DB
  @Column(unique = true, length = 6)
  private String inviteCode;

  private boolean personal = false;

  // --- FUNZIONI ADMIN ---

  @ManyToOne
  @JoinColumn(name = "admin_id")
  @JsonIgnoreProperties({"wallets", "password", "email"})
  private User admin;

  private BigDecimal monthlyBudget;

  private boolean active = true;

  // --- RELAZIONI ---

  @ManyToMany(mappedBy = "wallets")
  @JsonIgnoreProperties("wallets")
  private Set<User> members = new HashSet<>();

  public void addMember(User user) {
    this.members.add(user);
    user.getWallets().add(this);
  }
}
