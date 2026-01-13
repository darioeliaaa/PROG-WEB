package com.example.backend.repository;

import com.example.backend.entity.Transaction;
import org.springframework.data.domain.Pageable; // <--- IMPORTANTE
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {

  List<Transaction> findByWalletId(Long walletId);

  // ✅ NUOVO: Trova transazioni dell'utente, ordinate per data decrescente
  List<Transaction> findByUserIdOrderByDateDesc(Long userId, Pageable pageable);
}
