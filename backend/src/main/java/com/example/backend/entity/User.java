package com.example.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "users")
public class User {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(unique = true)
  private String username;

  @Column(unique = true)
  private String email;

  private String password;

  // --- CAMPI PROFILO (Gamification) ---
  private String nome;
  private String cognome;
  private String sesso;
  private LocalDate dataDiNascita;
  private String telefono;
  private String indirizzo;

  // --- RELAZIONE WALLET ---
  @ManyToMany(fetch = FetchType.LAZY, cascade = {CascadeType.PERSIST, CascadeType.MERGE})
  @JoinTable(
    name = "user_wallets",
    joinColumns = @JoinColumn(name = "user_id"),
    inverseJoinColumns = @JoinColumn(name = "wallet_id")
  )
  @JsonIgnoreProperties("members")
  private Set<Wallet> wallets = new HashSet<>();

  // --- RELAZIONE TRANSAZIONI (IL CUORE DEL PROXY) ---
  // 1. fetch = FetchType.LAZY: Abilita il proxy.
  // 2. NESSUN @JsonIgnore qui! Vogliamo che Spring provi a leggere questa lista
  //    quando invia il JSON al frontend. È questo che farà scattare il tuo
  //    UserProxy manuale e stamperà il messaggio in console.
  @OneToMany(mappedBy = "user", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
  private List<Transaction> transactions = new ArrayList<>();

  // --- CAMPI IMPOSTAZIONI ---
  private String language = "it";
  private String currency = "EUR";
  private boolean privacyMode = false;
  private boolean budgetAlerts = true;

  // --- COSTRUTTORI ---
  public User() {}

  public User(String username, String email, String password) {
    this.username = username;
    this.email = email;
    this.password = password;
  }

  // --- METODO GAMIFICATION ---
  public int getProfileCompletion() {
    int totalFields = 8;
    int filledFields = 0;
    if (username != null && !username.isEmpty()) filledFields++;
    if (email != null && !email.isEmpty()) filledFields++;
    if (nome != null && !nome.isEmpty()) filledFields++;
    if (cognome != null && !cognome.isEmpty()) filledFields++;
    if (sesso != null && !sesso.isEmpty()) filledFields++;
    if (dataDiNascita != null) filledFields++;
    if (telefono != null && !telefono.isEmpty()) filledFields++;
    if (indirizzo != null && !indirizzo.isEmpty()) filledFields++;
    return (int) ((filledFields / (double) totalFields) * 100);
  }

  // --- GETTER E SETTER ---
  public Long getId() { return id; }
  public void setId(Long id) { this.id = id; }

  public String getUsername() { return username; }
  public void setUsername(String username) { this.username = username; }

  public String getEmail() { return email; }
  public void setEmail(String email) { this.email = email; }

  public String getPassword() { return password; }
  public void setPassword(String password) { this.password = password; }

  public String getNome() { return nome; }
  public void setNome(String nome) { this.nome = nome; }

  public String getCognome() { return cognome; }
  public void setCognome(String cognome) { this.cognome = cognome; }

  public String getSesso() { return sesso; }
  public void setSesso(String sesso) { this.sesso = sesso; }

  public LocalDate getDataDiNascita() { return dataDiNascita; }
  public void setDataDiNascita(LocalDate dataDiNascita) { this.dataDiNascita = dataDiNascita; }

  public String getTelefono() { return telefono; }
  public void setTelefono(String telefono) { this.telefono = telefono; }

  public String getIndirizzo() { return indirizzo; }
  public void setIndirizzo(String indirizzo) { this.indirizzo = indirizzo; }

  public Set<Wallet> getWallets() { return wallets; }
  public void setWallets(Set<Wallet> wallets) { this.wallets = wallets; }

  public List<Transaction> getTransactions() { return transactions; }
  public void setTransactions(List<Transaction> transactions) { this.transactions = transactions; }

  public String getLanguage() { return language; }
  public void setLanguage(String language) { this.language = language; }

  public String getCurrency() { return currency; }
  public void setCurrency(String currency) { this.currency = currency; }

  @JsonProperty("privacyMode")
  public boolean isPrivacyMode() { return privacyMode; }
  public void setPrivacyMode(boolean privacyMode) { this.privacyMode = privacyMode; }

  @JsonProperty("budgetAlerts")
  public boolean isBudgetAlerts() { return budgetAlerts; }
  public void setBudgetAlerts(boolean budgetAlerts) { this.budgetAlerts = budgetAlerts; }
}
