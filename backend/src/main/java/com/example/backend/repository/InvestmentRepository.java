package com.example.backend.repository;

import com.example.backend.entity.Investment;
import com.example.backend.entity.Portfolio;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface InvestmentRepository extends JpaRepository<Investment, Long> {

  Optional<Investment> findByPortfolioAndSymbol(Portfolio portfolio, String symbol);

  // Il proxy userà questo per scaricare TUTTI gli investimenti quando clicchi "Vedi Portafoglio"
  List<Investment> findByPortfolioId(Long portfolioId);
}
