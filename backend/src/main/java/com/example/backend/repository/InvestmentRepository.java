package com.example.backend.repository;

import com.example.backend.entity.Investment;
import com.example.backend.entity.Portfolio;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface InvestmentRepository extends JpaRepository<Investment, Long> {

  // AGGIUNGI QUESTO PER TROVARE L'AZIONE NEL PORTFOLIO:
  Optional<Investment> findByPortfolioAndSymbol(Portfolio portfolio, String symbol);
}
