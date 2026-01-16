package com.example.backend.service;

import com.example.backend.dto.TradeRequestDTO;
import com.example.backend.entity.*;
import com.example.backend.repository.*;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class InvestmentService {

  @Autowired private InvestmentRepository investmentRepository;
  @Autowired private PortfolioRepository portfolioRepository;
  @Autowired private WalletRepository walletRepository;
  @Autowired private TransactionRepository transactionRepository;
  @Autowired private UserRepository userRepository;

  // METODO PER CALCOLARE IL SALDO REALE DAI MOVIMENTI
  // Somma tutte le ENTRATE e sottrae tutte le USCITE
  public BigDecimal getRealBalance(Long walletId) {
    List<Transaction> transactions = transactionRepository.findByWalletId(walletId);
    BigDecimal balance = BigDecimal.ZERO;

    for (Transaction t : transactions) {
      if (t.getType() == TransactionType.ENTRATA) {
        balance = balance.add(t.getAmount());
      } else if (t.getType() == TransactionType.USCITA) {
        balance = balance.subtract(t.getAmount());
      }
    }
    return balance;
  }

  // ESEGUE LA TRANSAZIONE (BUY o SELL)
  @Transactional
  public void executeTrade(TradeRequestDTO request) {
    // Recuperi base
    User user = userRepository.findById(request.getUserId())
      .orElseThrow(() -> new RuntimeException("Utente non trovato"));

    Wallet wallet = walletRepository.findByAdminAndPersonalTrue(user)
      .orElseThrow(() -> new RuntimeException("Wallet personale non trovato"));

    Portfolio portfolio = portfolioRepository.findByUser(user)
      .orElseGet(() -> {
        Portfolio p = new Portfolio();
        p.setUser(user);
        return portfolioRepository.save(p);
      });

    if ("SELL".equalsIgnoreCase(request.getAction())) {
      handleSell(request, user, wallet, portfolio);
    } else {
      handleBuy(request, user, wallet, portfolio);
    }
  }

  // --- LOGICA ACQUISTO (BUY) ---
  private void handleBuy(TradeRequestDTO request, User user, Wallet wallet, Portfolio portfolio) {
    double costDouble = request.getQuantity() * request.getPriceAtTransaction();
    BigDecimal totalCost = BigDecimal.valueOf(costDouble);

    // 1. CALCOLO IL SALDO REALE
    BigDecimal currentBalance = getRealBalance(wallet.getId());

    // 2. CONTROLLO FONDI
    if (currentBalance.compareTo(totalCost) < 0) {
      throw new RuntimeException("Fondi insufficienti! Hai disponibile: " + currentBalance + "€, ma servono: " + totalCost + "€");
    }

    // 3. AGGIORNO O CREO L'INVESTIMENTO
    Optional<Investment> existingInv = investmentRepository.findByPortfolioAndSymbol(portfolio, request.getSymbol());
    Investment investment;

    if (existingInv.isPresent()) {
      investment = existingInv.get();
      // Calcolo nuovo Prezzo Medio
      double currentTotalValue = investment.getQuantity() * investment.getAverageBuyPrice();
      double newPurchaseValue = request.getQuantity() * request.getPriceAtTransaction();
      double newTotalQty = investment.getQuantity() + request.getQuantity();

      investment.setAverageBuyPrice((currentTotalValue + newPurchaseValue) / newTotalQty);
      investment.setQuantity(newTotalQty);
    } else {
      investment = new Investment(portfolio, request.getSymbol(), request.getAssetName());
      investment.setQuantity(request.getQuantity());
      investment.setAverageBuyPrice(request.getPriceAtTransaction());
    }
    investment.setLastUpdateDate(LocalDate.now());
    investmentRepository.save(investment);

    // 4. AGGIORNO IL PORTFOLIO (Totale Investito)
    portfolio.setTotalInvested(portfolio.getTotalInvested() + costDouble);
    portfolioRepository.save(portfolio);

    // 5. REGISTRO LA TRANSAZIONE (USCITA)
    Transaction t = new Transaction();
    t.setUser(user);
    t.setWallet(wallet);
    t.setAmount(totalCost);
    t.setType(TransactionType.USCITA);
    t.setCategory("INVESTIMENTI");
    t.setDescription("BUY " + request.getSymbol() + " x" + request.getQuantity());
    t.setDate(LocalDate.now());
    transactionRepository.save(t);
  }

  // --- LOGICA VENDITA (SELL) ---
  private void handleSell(TradeRequestDTO request, User user, Wallet wallet, Portfolio portfolio) {
    Investment investment = investmentRepository.findByPortfolioAndSymbol(portfolio, request.getSymbol())
      .orElseThrow(() -> new RuntimeException("Non possiedi questo asset!"));

    if (investment.getQuantity() < request.getQuantity()) {
      throw new RuntimeException("Non hai abbastanza azioni da vendere!");
    }

    // Calcoli
    double saleValue = request.getQuantity() * request.getPriceAtTransaction();
    double costBasis = request.getQuantity() * investment.getAverageBuyPrice();
    BigDecimal income = BigDecimal.valueOf(saleValue);

    // Aggiorno quantità
    investment.setQuantity(investment.getQuantity() - request.getQuantity());
    if (investment.getQuantity() <= 0.0001) investment.setQuantity(0);
    investmentRepository.save(investment);

    // Aggiorno Portfolio
    portfolio.setTotalInvested(portfolio.getTotalInvested() - costBasis);
    if(portfolio.getTotalInvested() < 0) portfolio.setTotalInvested(0);
    portfolioRepository.save(portfolio);

    // REGISTRO LA TRANSAZIONE (ENTRATA)
    Transaction t = new Transaction();
    t.setUser(user);
    t.setWallet(wallet);
    t.setAmount(income);
    t.setType(TransactionType.ENTRATA);
    t.setCategory("INVESTIMENTI");
    t.setDescription("SELL " + request.getSymbol());
    t.setDate(LocalDate.now());
    transactionRepository.save(t);
  }
}
