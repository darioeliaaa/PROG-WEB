package com.example.backend.controller;

import com.example.backend.dto.PortfolioOverviewDTO;
import com.example.backend.entity.*;
import com.example.backend.proxy.PortfolioProxy;
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

  // Serve al Proxy per poter caricare i dati "Lazy"
  @Autowired private InvestmentRepository investmentRepository;


  @GetMapping("/{userId}")
  public ResponseEntity<?> getPortfolioOverview(@PathVariable Long userId) {
    User user = userRepository.findById(userId).orElse(null);
    if (user == null) return ResponseEntity.notFound().build();

    // Recuperiamo il portafoglio "grezzo" dal DB
    Portfolio rawPortfolio = portfolioRepository.findByUser(user).orElse(new Portfolio());

    PortfolioProxy portfolioProxy = new PortfolioProxy(
      rawPortfolio.getId(),
      rawPortfolio.getName(),
      investmentRepository
    );

    PortfolioOverviewDTO response = new PortfolioOverviewDTO();
    List<PortfolioOverviewDTO.AssetPerformanceDTO> assetList = new ArrayList<>();

    double grandTotalValue = 0.0;
    double grandTotalInvested = rawPortfolio.getTotalInvested(); // Questo dato ce l'abbiamo subito

    if (portfolioProxy.getInvestments() != null) {
      for (Investment inv : portfolioProxy.getInvestments()) {

        if (inv.getQuantity() <= 0.0001) continue;

        // --- Logica Calcoli  ---
        double livePrice = marketService.getCurrentPrice(inv.getSymbol());
        if (livePrice == 0) livePrice = inv.getAverageBuyPrice();

        double currentValue = inv.getQuantity() * livePrice;
        double costBasis = inv.getQuantity() * inv.getAverageBuyPrice();

        PortfolioOverviewDTO.AssetPerformanceDTO dto = new PortfolioOverviewDTO.AssetPerformanceDTO();
        dto.setSymbol(inv.getSymbol());
        dto.setName(inv.getName()); // Se non hai il campo name in Investment, togli questa riga o aggiungilo all'Entity
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
      BigDecimal realBalance = investmentService.getRealBalance(wallet.getId());
      response.setAvailableCash(realBalance.doubleValue());
    }

    return ResponseEntity.ok(response);
  }
}
