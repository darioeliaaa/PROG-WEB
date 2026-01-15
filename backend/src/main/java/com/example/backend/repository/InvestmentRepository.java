package com.example.backend.repository;

import com.example.backend.entity.Investment;
import com.example.backend.entity.Portfolio;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List; // <--- Importante per le liste
import java.util.Optional;

public interface InvestmentRepository extends JpaRepository<Investment, Long> {

  // Metodo esistente (va bene per comprare/vendere azioni singole)
  Optional<Investment> findByPortfolioAndSymbol(Portfolio portfolio, String symbol);

  // ✅ METODO FONDAMENTALE PER IL PROXY (PortfolioProxy)
  // Il proxy userà questo per scaricare TUTTI gli investimenti quando clicchi "Vedi Portafoglio"
  List<Investment> findByPortfolioId(Long portfolioId);
}
