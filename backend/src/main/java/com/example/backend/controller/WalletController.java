package com.example.backend.controller;

import com.example.backend.entity.User;
import com.example.backend.entity.Wallet;
import com.example.backend.repository.UserRepository;
import com.example.backend.service.WalletService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/wallets")
@CrossOrigin(origins = "http://localhost:4200")
public class WalletController {

  @Autowired
  private final WalletService walletService;

  @Autowired
  private UserRepository userRepository;

  public WalletController(WalletService walletService) {
    this.walletService = walletService;
  }

  // --- GET USER WALLETS ---
  @GetMapping("/user/{userId}")
  public ResponseEntity<?> getUserWallets(@PathVariable Long userId) {
    // Invece di chiedere all'utente, chiediamo direttamente alla tabella dei wallet
    // Questo risolve il problema "lista vuota" o "non aggiornata"
    return ResponseEntity.ok(walletService.findWalletsByUserId(userId));
  }

  // --- CREA WALLET CONDIVISO ---
  // NOTA: Ho rinominato il parametro in 'walletName' perché il tuo frontend manda '?walletName=...'
  @PostMapping("/user/{userId}/create")
  public Wallet create(@PathVariable Long userId, @RequestParam String walletName) {
    return walletService.createSharedWallet(userId, walletName);
  }

  // --- ✅ NUOVO ENDPOINT: UNISCITI TRAMITE CODICE ---
  // Questo è quello che viene chiamato dal tasto "Unisciti" del frontend
  @PostMapping("/join-by-code")
  public ResponseEntity<Wallet> joinByCode(
    @RequestParam String inviteCode,
    @RequestParam Long userId
  ) {
    Wallet wallet = walletService.joinWalletByCode(inviteCode, userId);
    return ResponseEntity.ok(wallet);
  }
  // --------------------------------------------------

  // Trasferimento soldi tra wallet
  @PostMapping("/transfer")
  public ResponseEntity<String> transfer(@RequestParam Long userId, @RequestParam Long fromId,
                                         @RequestParam Long toId, @RequestParam BigDecimal amount) {
    walletService.transferMoney(userId, fromId, toId, amount);
    return ResponseEntity.ok("Trasferimento completato");
  }

  // Invito amico (vecchio metodo tramite username)
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

  // Endpoint legacy per join tramite ID (puoi mantenerlo o rimuoverlo)
  @PostMapping("/{walletId}/join")
  public ResponseEntity<Wallet> joinWallet(@PathVariable Long walletId, @RequestParam Long userId) {
    Wallet wallet = walletService.joinWallet(walletId, userId);
    return ResponseEntity.ok(wallet);
  }
}
