package com.example.backend.repository;

import com.example.backend.entity.User;
import com.example.backend.entity.Wallet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WalletRepository extends JpaRepository<Wallet, Long> {

  Optional<Wallet> findByAdminAndPersonalTrue(User admin);

  Optional<Wallet> findByInviteCode(String inviteCode);

  boolean existsByInviteCode(String inviteCode);

  List<Wallet> findAllByMembers_Id(Long userId);

  @Modifying
  @Query(value = "DELETE FROM user_wallets WHERE wallet_id = :walletId AND user_id = :userId", nativeQuery = true)
  void detachMember(@Param("walletId") Long walletId, @Param("userId") Long userId);

  @Modifying
  @Query(value = "DELETE FROM user_wallets WHERE wallet_id = :walletId", nativeQuery = true)
  void detachAllMembers(@Param("walletId") Long walletId);

  // Scrive direttamente nel DB saltando i controlli di cache JPA
  @Modifying
  @Query("UPDATE Wallet w SET w.admin = :newAdmin WHERE w.id = :walletId")
  void updateWalletAdmin(@Param("walletId") Long walletId, @Param("newAdmin") User newAdmin);
}
