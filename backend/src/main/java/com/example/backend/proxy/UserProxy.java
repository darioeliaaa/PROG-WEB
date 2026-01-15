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

    // Copiamo le impostazioni per evitare che tornino null
    this.setLanguage(userBase.getLanguage());
    this.setCurrency(userBase.getCurrency());
    this.setPrivacyMode(userBase.isPrivacyMode());
    this.setBudgetAlerts(userBase.isBudgetAlerts());

    this.transactionRepository = repo;

    // 🔥 CORREZIONE FONDAMENTALE 🔥
    // Distruggiamo la ArrayList vuota creata dall'Entity User.
    // Settando a NULL, abilitiamo il Lazy Loading manuale qui sotto.
    super.setTransactions(null);
  }

  @Override
  public List<Transaction> getTransactions() {
    // Ora entra qui perché l'abbiamo settato a null nel costruttore
    if (super.getTransactions() == null) {

      System.out.println("--- 🛡️ PROXY USER ATTIVATO: Sto recuperando lo storico transazioni per Utente ID: " + this.getId() + " ---");

      List<Transaction> realTransactions = transactionRepository.findByUserId(this.getId());
      super.setTransactions(realTransactions);
    }

    return super.getTransactions();
  }
}
