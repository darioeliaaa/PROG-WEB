package com.example.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import java.time.LocalDate; // ✅ Aggiunto per gestire la data di nascita
import java.util.HashSet;
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

  // --- NUOVI CAMPI PER IL PROFILO (Default NULL) ---
  private String nome;
  private String cognome;
  private String sesso;
  private LocalDate dataDiNascita;
  private String telefono;
  private String indirizzo;

  @ManyToMany(fetch = FetchType.LAZY, cascade = {CascadeType.PERSIST, CascadeType.MERGE})
  @JoinTable(
    name = "user_wallets",
    joinColumns = @JoinColumn(name = "user_id"),
    inverseJoinColumns = @JoinColumn(name = "wallet_id")
  )
  @JsonIgnoreProperties("members")
  private Set<Wallet> wallets = new HashSet<>();

  // --- COSTRUTTORI ---
  public User() {
  }

  public User(String username, String email, String password) {
    this.username = username;
    this.email = email;
    this.password = password;

  }

  // --- METODO GAMIFICATION (Calcolo Percentuale) ---
  public int getProfileCompletion() {
    // Totale campi da monitorare: 8
    // 2 Base (Username, Email) + 6 Anagrafici (Nome, Cognome, Sesso, Data, Tel, Indirizzo)
    int totalFields = 8;
    int filledFields = 0;

    // 1. Campi Base (Questi ci sono quasi sempre, quindi danno il "bonus" iniziale)
    if (username != null && !username.isEmpty()) filledFields++;
    if (email != null && !email.isEmpty()) filledFields++;

    // 2. Campi Opzionali (Quelli da compilare)
    if (nome != null && !nome.isEmpty()) filledFields++;
    if (cognome != null && !cognome.isEmpty()) filledFields++;
    if (sesso != null && !sesso.isEmpty()) filledFields++;
    if (dataDiNascita != null) filledFields++;
    if (telefono != null && !telefono.isEmpty()) filledFields++;
    if (indirizzo != null && !indirizzo.isEmpty()) filledFields++;

    // Calcolo percentuale
    return (int) ((filledFields / (double) totalFields) * 100);
  }

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public String getUsername() {
    return username;
  }

  public void setUsername(String username) {
    this.username = username;
  }

  public String getEmail() {
    return email;
  }

  public void setEmail(String email) {
    this.email = email;
  }

  public String getPassword() {
    return password;
  }

  public void setPassword(String password) {
    this.password = password;
  }

  public String getNome() {
    return nome;
  }

  public void setNome(String nome) {
    this.nome = nome;
  }

  public String getCognome() {
    return cognome;
  }

  public void setCognome(String cognome) {
    this.cognome = cognome;
  }

  public String getSesso() {
    return sesso;
  }

  public void setSesso(String sesso) {
    this.sesso = sesso;
  }

  public LocalDate getDataDiNascita() {
    return dataDiNascita;
  }

  public void setDataDiNascita(LocalDate dataDiNascita) {
    this.dataDiNascita = dataDiNascita;
  }

  public String getTelefono() {
    return telefono;
  }

  public void setTelefono(String telefono) {
    this.telefono = telefono;
  }

  public String getIndirizzo() {
    return indirizzo;
  }

  public void setIndirizzo(String indirizzo) {
    this.indirizzo = indirizzo;
  }

  public Set<Wallet> getWallets() {
    return wallets;
  }

  public void setWallets(Set<Wallet> wallets) {
    this.wallets = wallets;
  }
  // --- CAMPI PER IMPOSTAZIONI DI SISTEMA (Valori default inclusi) ---
  private String language = "it";
  private String currency = "EUR";
  private boolean privacyMode = false;
  private boolean budgetAlerts = true;

  // --- GETTER E SETTER ---
  public String getLanguage() { return language; }
  public void setLanguage(String language) { this.language = language; }

  public String getCurrency() { return currency; }
  public void setCurrency(String currency) { this.currency = currency; }


  @JsonProperty("privacyMode") // Forza il nome nel JSON
  public boolean isPrivacyMode() { return privacyMode; }
  public void setPrivacyMode(boolean privacyMode) { this.privacyMode = privacyMode; }

  @JsonProperty("budgetAlerts") // Forza il nome nel JSON
  public boolean isBudgetAlerts() { return budgetAlerts; }
  public void setBudgetAlerts(boolean budgetAlerts) { this.budgetAlerts = budgetAlerts; }

}
