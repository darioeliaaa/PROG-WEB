package com.example.backend.repository;

import com.example.backend.entity.Transaction;
import org.springframework.data.domain.Pageable;// <--- IMPORTANTE
import com.example.backend.entity.Wallet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying; // ✅
import org.springframework.data.jpa.repository.Query;     // ✅
import org.springframework.data.repository.query.Param;   // ✅
import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {

  List<Transaction> findByWalletId(Long walletId);

  List<Transaction> findByWallet(Wallet wallet);

  void deleteByWallet(Wallet wallet);

  // ✅ NUOVO: Trova transazioni dell'utente, ordinate per data decrescente
  List<Transaction> findByUserIdOrderByDateDesc(Long userId, Pageable pageable);

  // ✅ METODO DI PULIZIA
  @Modifying
  @Query("DELETE FROM Transaction t WHERE t.wallet.id = :walletId")
  void deleteByWalletId(@Param("walletId") Long walletId);
}
