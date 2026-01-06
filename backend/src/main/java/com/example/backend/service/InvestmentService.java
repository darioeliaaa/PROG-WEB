package com.example.backend.service;

import com.example.backend.entity.Investment;
import com.example.backend.entity.User;
import com.example.backend.repository.InvestmentRepository;
import com.example.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class InvestmentService {

  @Autowired
  private InvestmentRepository investmentRepository;

  @Autowired
  private UserRepository userRepository;

  // COMPRA AZIONE
  public Investment buyStock(Long userId, Investment investment) {
    User user = userRepository.findById(userId)
      .orElseThrow(() -> new RuntimeException("Utente non trovato"));

    investment.setUser(user);

    // Se la data non c'è, mettiamo oggi
    if (investment.getPurchaseDate() == null) {
      investment.setPurchaseDate(LocalDate.now());
    }

    return investmentRepository.save(investment);
  }

  // LISTA PORTAFOGLIO UTENTE
  public List<Investment> getUserPortfolio(Long userId) {
    return investmentRepository.findByUserId(userId);
  }
}
