package com.example.backend.repository;

import com.example.backend.entity.Transaction;
import com.example.backend.entity.Wallet;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {

  List<Transaction> findByWalletId(Long walletId);

  List<Transaction> findByWallet(Wallet wallet);

  void deleteByWallet(Wallet wallet);

  List<Transaction> findByUserId(Long userId);

  // Trova transazioni dell'utente, ordinate per data decrescente (per la dashboard)
  List<Transaction> findByUserIdOrderByDateDesc(Long userId, Pageable pageable);


  @Modifying
  @Query("DELETE FROM Transaction t WHERE t.wallet.id = :walletId")
  void deleteByWalletId(@Param("walletId") Long walletId);
}
