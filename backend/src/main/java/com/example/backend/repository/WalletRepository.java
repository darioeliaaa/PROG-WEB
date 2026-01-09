package com.example.backend.repository;


import com.example.backend.entity.Wallet;
import org.springframework.data.jpa.repository.JpaRepository;


public interface WalletRepository extends JpaRepository<Wallet, Long> {}
