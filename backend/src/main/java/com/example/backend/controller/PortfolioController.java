package com.example.backend.controller;

import com.example.backend.dto.PortfolioOverviewDTO;
import com.example.backend.entity.*;
import com.example.backend.repository.*;
import com.example.backend.service.InvestmentService;
import com.example.backend.service.MarketService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/portfolio")
@CrossOrigin(origins = "http://localhost:4200")
public class PortfolioController {

  @Autowired private PortfolioRepository portfolioRepository;
  @Autowired private UserRepository userRepository;
  @Autowired private MarketService marketService;
  @Autowired private InvestmentService investmentService;
  @Autowired private WalletRepository walletRepository;


  @GetMapping("/{userId}")
  public ResponseEntity<?> getPortfolioOverview(@PathVariable Long userId) {
    User user = userRepository.findById(userId).orElse(null);
    if (user == null) return ResponseEntity.notFound().build();

    // Se l'utente non ha ancora un portafoglio, ne creiamo uno vuoto in memoria per non dare errore
    Portfolio portfolio = portfolioRepository.findByUser(user).orElse(new Portfolio());

    PortfolioOverviewDTO response = new PortfolioOverviewDTO();
    List<PortfolioOverviewDTO.AssetPerformanceDTO> assetList = new ArrayList<>();

    double grandTotalValue = 0.0;
    double grandTotalInvested = portfolio.getTotalInvested();

    // Se ci sono investimenti, calcoliamo il valore attuale
    if (portfolio.getInvestments() != null) {
      for (Investment inv : portfolio.getInvestments()) {
        if (inv.getQuantity() <= 0.0001) continue; // Saltiamo quelli venduti

        // 1. Chiediamo al MarketService il prezzo ATTUALE
        double livePrice = marketService.getCurrentPrice(inv.getSymbol());
        // Fallback: se l'API fallisce e torna 0, usiamo il prezzo medio di acquisto per non rompere i calcoli
        if (livePrice == 0) livePrice = inv.getAverageBuyPrice();

        // 2. Facciamo i calcoli
        double currentValue = inv.getQuantity() * livePrice;
        double costBasis = inv.getQuantity() * inv.getAverageBuyPrice();

        PortfolioOverviewDTO.AssetPerformanceDTO dto = new PortfolioOverviewDTO.AssetPerformanceDTO();
        dto.setSymbol(inv.getSymbol());
        dto.setName(inv.getName());
        dto.setQuantity(inv.getQuantity());
        dto.setAvgBuyPrice(inv.getAverageBuyPrice());
        dto.setCurrentPrice(livePrice);
        dto.setCurrentValue(currentValue);
        dto.setProfit(currentValue - costBasis);
        dto.setProfitPercent(costBasis > 0 ? ((currentValue - costBasis) / costBasis) * 100 : 0);

        assetList.add(dto);
        grandTotalValue += currentValue;
      }
    }

    response.setAssets(assetList);
    response.setCurrentTotalValue(grandTotalValue);
    response.setTotalInvested(grandTotalInvested);
    response.setTotalProfit(grandTotalValue - grandTotalInvested);
    response.setTotalProfitPercent(grandTotalInvested > 0 ? ((grandTotalValue - grandTotalInvested) / grandTotalInvested) * 100 : 0);

    Wallet wallet = walletRepository.findByAdminAndPersonalTrue(user).orElse(null);
    if (wallet != null) {
      // Usa il nuovo metodo getRealBalance che abbiamo appena creato
      BigDecimal realBalance = investmentService.getRealBalance(wallet.getId());
      response.setAvailableCash(realBalance.doubleValue());
    }

    return ResponseEntity.ok(response);
  }
}
