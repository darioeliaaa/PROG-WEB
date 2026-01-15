package com.example.backend.controller;

import com.example.backend.entity.User;
import com.example.backend.entity.Wallet;
import com.example.backend.repository.UserRepository;
import com.example.backend.repository.WalletRepository;
import com.example.backend.service.WalletService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap; // ✅ IMPORTANTE
import java.util.Map;     // ✅ IMPORTANTE

@RestController
@RequestMapping("/api/wallets")
@CrossOrigin(origins = "http://localhost:4200")
public class WalletController {

  @Autowired
  private final WalletService walletService;

  @Autowired
  private UserRepository userRepository;

  @Autowired
  private WalletRepository walletRepository;

  public WalletController(WalletService walletService) {
    this.walletService = walletService;
  }

  // --- GET USER WALLETS ---
  @GetMapping("/user/{userId}")
  public ResponseEntity<?> getUserWallets(@PathVariable Long userId) {
    User user = userRepository.findById(userId).orElse(null);
    if (user == null) {
      return ResponseEntity.notFound().build();
    }
    return ResponseEntity.ok(user.getWallets());
  }

  @GetMapping("/{id}")
  public ResponseEntity<?> getWalletById(@PathVariable Long id) {
    // Verifica se il wallet esiste nel repository
    return walletRepository.findById(id)
      .map(ResponseEntity::ok)
      .orElse(ResponseEntity.notFound().build());
  }

  // --- CREA WALLET ---
  @PostMapping("/user/{userId}/create")
  public Wallet create(@PathVariable Long userId, @RequestParam String walletName) {
    return walletService.createSharedWallet(userId, walletName);
  }

  // --- JOIN BY CODE ---
  @PostMapping("/join-by-code")
  public ResponseEntity<Wallet> joinByCode(@RequestParam String inviteCode, @RequestParam Long userId) {
    Wallet wallet = walletService.joinWalletByCode(inviteCode, userId);
    return ResponseEntity.ok(wallet);
  }

  // --- ✅ FIX 1: AGGIORNAMENTO BUDGET E LIMITI (IMPORTI) ---
  // Ora restituisce un JSON, risolvendo l'errore sugli importi
  @PutMapping("/{walletId}/settings")
  public ResponseEntity<?> updateSettings(
    @RequestParam Long adminId,
    @PathVariable Long walletId,
    @RequestParam(required = false) BigDecimal budget,
    @RequestParam(required = false) BigDecimal maxTransfer
  ) {
    walletService.updateWalletLimits(adminId, walletId, budget, maxTransfer);

    Map<String, String> response = new HashMap<>();
    response.put("message", "Impostazioni aggiornate con successo!");
    return ResponseEntity.ok(response);
  }

  // (Mantieni questo per compatibilità se serve, ma convertilo a JSON)
  @PutMapping("/{walletId}/budget")
  public ResponseEntity<?> updateBudget(@RequestParam Long adminId, @PathVariable Long walletId, @RequestParam BigDecimal budget) {
    walletService.setWalletBudget(adminId, walletId, budget);

    Map<String, String> response = new HashMap<>();
    response.put("message", "Budget aggiornato!");
    return ResponseEntity.ok(response);
  }

  // --- ✅ FIX 2: RIMOZIONE MEMBRO ---
  @DeleteMapping("/{walletId}/remove-member/{memberId}")
  public ResponseEntity<?> removeMember(@RequestParam Long adminId, @PathVariable Long walletId, @PathVariable Long memberId) {
    walletService.removeMember(adminId, walletId, memberId);

    // Restituiamo un JSON valido
    Map<String, String> response = new HashMap<>();
    response.put("message", "Membro rimosso con successo");
    return ResponseEntity.ok(response);
  }

  // --- ✅ FIX 3: ELIMINAZIONE WALLET ---
  @DeleteMapping("/{walletId}")
  public ResponseEntity<?> deleteWallet(@RequestParam Long adminId, @PathVariable Long walletId) {
    walletService.deleteWallet(adminId, walletId);

    // Restituiamo un JSON valido
    Map<String, String> response = new HashMap<>();
    response.put("message", "Wallet eliminato con successo");
    return ResponseEntity.ok(response);
  }

  // --- Altri metodi (Converti anche questi se danno errore) ---

  @PutMapping("/{walletId}/status")
  public ResponseEntity<?> updateStatus(@RequestParam Long adminId, @PathVariable Long walletId, @RequestParam boolean active) {
    walletService.toggleWalletStatus(adminId, walletId, active);

    Map<String, String> response = new HashMap<>();
    response.put("message", "Stato aggiornato");
    return ResponseEntity.ok(response);
  }

  @PostMapping("/transfer")
  public ResponseEntity<?> transfer(@RequestParam Long userId, @RequestParam Long fromId, @RequestParam Long toId, @RequestParam BigDecimal amount) {
    walletService.transferMoney(userId, fromId, toId, amount);

    Map<String, String> response = new HashMap<>();
    response.put("message", "Trasferimento completato");
    return ResponseEntity.ok(response);
  }

  @PostMapping("/{walletId}/invite/{username}")
  public ResponseEntity<?> invite(@PathVariable Long walletId, @PathVariable String username) {
    walletService.inviteByUsername(walletId, username);

    Map<String, String> response = new HashMap<>();
    response.put("message", "Invitato con successo");
    return ResponseEntity.ok(response);
  }

  // Legacy join
  @PostMapping("/{walletId}/join")
  public ResponseEntity<Wallet> joinWallet(@PathVariable Long walletId, @RequestParam Long userId) {
    Wallet wallet = walletService.joinWallet(walletId, userId);
    return ResponseEntity.ok(wallet);
  }
}
