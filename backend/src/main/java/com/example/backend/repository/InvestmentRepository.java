package com.example.backend.repository;

import com.example.backend.entity.Investment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface InvestmentRepository extends JpaRepository<Investment, Long> {
  // Trova tutti gli investimenti di un utente
  List<Investment> findByUserId(Long userId);

  // Trova se l'utente ha già comprato azioni di QUELLA azienda (utile per sommarle)
  List<Investment> findByUserIdAndSymbol(Long userId, String symbol);
}
