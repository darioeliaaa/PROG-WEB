package com.example.backend.controller;

import com.example.backend.entity.Wallet;
import com.example.backend.service.WalletService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Set;

@RestController
@RequestMapping("/api/wallets")
@CrossOrigin(origins = "http://localhost:4200")
public class WalletController {
  @Autowired private WalletService walletService;

  // Crea wallet condiviso
  @PostMapping("/user/{userId}/create")
  public Wallet create(@PathVariable Long userId, @RequestParam String name) {
    return walletService.createSharedWallet(userId, name);
  }

  // Trasferimento soldi tra wallet
  @PostMapping("/transfer")
  public ResponseEntity<String> transfer(@RequestParam Long userId, @RequestParam Long fromId,
                                         @RequestParam Long toId, @RequestParam BigDecimal amount) {
    walletService.transferMoney(userId, fromId, toId, amount);
    return ResponseEntity.ok("Trasferimento completato");
  }

  // Invito amico
  @PostMapping("/{walletId}/invite/{username}")
  public ResponseEntity<String> invite(@PathVariable Long walletId, @PathVariable String username) {
    walletService.inviteByUsername(walletId, username);
    return ResponseEntity.ok("Invitato con successo");
  }
}

