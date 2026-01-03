package com.example.backend.repository;

import com.example.backend.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {
  // Trova tutti i movimenti di uno specifico utente
  List<Transaction> findByUserId(Long userId);
}
