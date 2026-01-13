package com.example.backend.repository;

import com.example.backend.entity.User; // <--- ASSICURATI DI AVERE QUESTO IMPORT
import com.example.backend.entity.Wallet;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface WalletRepository extends JpaRepository<Wallet, Long> {

  // ✅ 1. METODO FONDAMENTALE (Cerca il wallet personale dell'utente)
  // Senza questo, il Trading e la Dashboard si rompono!
  Optional<Wallet> findByAdminAndPersonalTrue(User admin);

  // ✅ 2. NUOVO: Cerca un wallet usando il codice invito
  Optional<Wallet> findByInviteCode(String inviteCode);

  // ✅ 3. NUOVO: Serve per verificare se un codice esiste già
  boolean existsByInviteCode(String inviteCode);

  List<Wallet> findAllByMembers_Id(Long userId);
}
