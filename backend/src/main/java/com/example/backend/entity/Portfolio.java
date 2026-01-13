package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.util.ArrayList;
import java.util.List;

@Entity
@Data
@Table(name = "portfolios")
public class Portfolio {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  // Ogni utente ha UN solo portafoglio titoli principale
  @OneToOne
  @JoinColumn(name = "user_id", referencedColumnName = "id")
  private User user;

  // Totale investito (somma di quanto hai speso per le azioni attuali)
  private double totalInvested = 0.0;

  // Lista delle azioni possedute
  @OneToMany(mappedBy = "portfolio", cascade = CascadeType.ALL, orphanRemoval = true)
  private List<Investment> investments = new ArrayList<>();
}
