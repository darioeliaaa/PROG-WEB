package com.example.backend.repository;

import com.example.backend.entity.Portfolio;
import com.example.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface PortfolioRepository extends JpaRepository<Portfolio, Long> {
  Optional<Portfolio> findByUser(User user);
}
