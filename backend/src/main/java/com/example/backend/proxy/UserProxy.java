package com.example.backend.proxy;

import com.example.backend.entity.Transaction;
import com.example.backend.entity.User;
import com.example.backend.repository.TransactionRepository;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.util.List;

public class UserProxy extends User {

  @JsonIgnore
  private TransactionRepository transactionRepository;

  public UserProxy(User userBase, TransactionRepository repo) {
    super();
    this.setId(userBase.getId());
    this.setNome(userBase.getNome());
    this.setCognome(userBase.getCognome());
    this.setEmail(userBase.getEmail());
    this.setUsername(userBase.getUsername());
    this.setWallets(userBase.getWallets());

    this.setSesso(userBase.getSesso());
    this.setDataDiNascita(userBase.getDataDiNascita());
    this.setTelefono(userBase.getTelefono());
    this.setIndirizzo(userBase.getIndirizzo());

    this.setLanguage(userBase.getLanguage());
    this.setCurrency(userBase.getCurrency());
    this.setPrivacyMode(userBase.isPrivacyMode());
    this.setBudgetAlerts(userBase.isBudgetAlerts());

    this.setResetToken(userBase.getResetToken());

    this.transactionRepository = repo;

    super.setTransactions(null);
  }

  @Override
  public List<Transaction> getTransactions() {
    if (super.getTransactions() == null) {
      System.out.println("--- 🛡️ PROXY USER ATTIVATO: Recupero storico transazioni ID: " + this.getId() + " ---");
      List<Transaction> realTransactions = transactionRepository.findByUserId(this.getId());
      super.setTransactions(realTransactions);
    }
    return super.getTransactions();
  }
}
