package com.example.backend.controller;

import com.example.backend.entity.User; // <--- AGGIUNTO
import com.example.backend.entity.Wallet;
import com.example.backend.repository.UserRepository; // <--- AGGIUNTO
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

  @Autowired
  private final WalletService walletService;

  @Autowired
  private UserRepository userRepository; // <--- FONDAMENTALE PER TROVARE L'UTENTE

  public WalletController(WalletService walletService) {
    this.walletService = walletService;
  }

  // --- QUESTO È IL METODO CHE MANCAVA ---
  @GetMapping("/user/{userId}")
  public ResponseEntity<?> getUserWallets(@PathVariable Long userId) {
    // Cerchiamo l'utente nel database
    User user = userRepository.findById(userId).orElse(null);

    if (user == null) {
      return ResponseEntity.notFound().build();
    }

    // Restituiamo la lista dei suoi wallet
    return ResponseEntity.ok(user.getWallets());
  }
  // --------------------------------------

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

  @DeleteMapping("/{walletId}/remove-member/{memberId}")
  public ResponseEntity<?> removeMember(@RequestParam Long adminId, @PathVariable Long walletId, @PathVariable Long memberId) {
    walletService.removeMember(adminId, walletId, memberId);
    return ResponseEntity.ok("Membro rimosso");
  }

  @DeleteMapping("/{walletId}")
  public ResponseEntity<?> deleteWallet(@RequestParam Long adminId, @PathVariable Long walletId) {
    walletService.deleteWallet(adminId, walletId);
    return ResponseEntity.ok("Wallet eliminato");
  }

  // Endpoint per cambiare il budget
  @PutMapping("/{walletId}/budget")
  public ResponseEntity<?> updateBudget(@RequestParam Long adminId, @PathVariable Long walletId, @RequestParam BigDecimal budget) {
    walletService.setWalletBudget(adminId, walletId, budget);
    return ResponseEntity.ok("Budget aggiornato correttamente");
  }

  // Endpoint per attivare/disattivare il wallet
  @PutMapping("/{walletId}/status")
  public ResponseEntity<?> updateStatus(@RequestParam Long adminId, @PathVariable Long walletId, @RequestParam boolean active) {
    walletService.toggleWalletStatus(adminId, walletId, active);
    return ResponseEntity.ok("Stato del portafoglio aggiornato");
  }

  @PostMapping("/{walletId}/join")
  public ResponseEntity<Wallet> joinWallet(
    @PathVariable Long walletId,
    @RequestParam Long userId) {  // <-- ID dell'utente che vuole entrare
    Wallet wallet = walletService.joinWallet(walletId, userId);
    return ResponseEntity.ok(wallet);
  }


}
