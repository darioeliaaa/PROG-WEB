package com.example.backend.proxy;

import com.example.backend.entity.Investment;
import com.example.backend.entity.Portfolio;
import com.example.backend.repository.InvestmentRepository;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.util.List;

public class PortfolioProxy extends Portfolio {

  @JsonIgnore
  private InvestmentRepository investmentRepository;

  public PortfolioProxy(Long id, String nome, InvestmentRepository repo) {
    super();
    this.setId(id);
    this.setName(nome);
    this.investmentRepository = repo;

    // L'Entity Portfolio inizializza la lista come "new ArrayList()".
    // Dobbiamo forzarla a NULL, altrimenti il controllo "if (== null)" sotto fallisce
    // e non scarica mai i dati dal DB.
    super.setInvestments(null);
  }

  @Override
  public List<Investment> getInvestments() {
    if (super.getInvestments() == null) {

      System.out.println("--- 🛡️ PROXY PORTFOLIO ATTIVATO: Caricamento Lazy Investimenti per ID: " + this.getId() + " ---");

      List<Investment> realInvestments = investmentRepository.findByPortfolioId(this.getId());
      super.setInvestments(realInvestments);
    }

    return super.getInvestments();
  }
}
