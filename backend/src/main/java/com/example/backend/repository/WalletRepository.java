package com.example.backend.repository;

import com.example.backend.entity.User; // <--- ASSICURATI DI AVERE QUESTO IMPORT
import com.example.backend.entity.Wallet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying; // ✅ IMPORTANTE
import org.springframework.data.jpa.repository.Query;     // ✅ IMPORTANTE
import org.springframework.data.repository.query.Param;   // ✅ IMPORTANTE
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

  // 1. Per rimuovere un singolo membro (senza impazzire con gli oggetti Java)
  @Modifying
  @Query(value = "DELETE FROM user_wallets WHERE wallet_id = :walletId AND user_id = :userId", nativeQuery = true)
  void detachMember(@Param("walletId") Long walletId, @Param("userId") Long userId);

  // 2. Per rimuovere TUTTI i membri prima di cancellare il wallet
  @Modifying
  @Query(value = "DELETE FROM user_wallets WHERE wallet_id = :walletId", nativeQuery = true)
  void detachAllMembers(@Param("walletId") Long walletId);
}
