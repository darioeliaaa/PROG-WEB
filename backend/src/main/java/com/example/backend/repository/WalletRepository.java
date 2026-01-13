package com.example.backend.repository;

import com.example.backend.entity.Wallet;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface WalletRepository extends JpaRepository<Wallet, Long> {

  // ✅ NUOVO: Cerca un wallet usando il codice invito (es. "A1B2C3")
  Optional<Wallet> findByInviteCode(String inviteCode);

  // ✅ NUOVO: Serve al generatore per assicurarsi che il codice non esista già
  boolean existsByInviteCode(String inviteCode);
}
