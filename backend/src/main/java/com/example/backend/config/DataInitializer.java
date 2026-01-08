package com.example.backend.config; // O il tuo package base

import com.example.backend.entity.MarketAsset;
import com.example.backend.repository.MarketAssetRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Arrays;

@Configuration
public class DataInitializer {

  @Bean
  public CommandLineRunner loadData(MarketAssetRepository repository) {
    return args -> {
      // Controlliamo se la tabella è vuota. Se ha già dati, non facciamo nulla.
      if (repository.count() == 0) {
        System.out.println("⚡ Inizializzazione Database: Caricamento Asset di mercato...");

        // 1. STOCKS
        MarketAsset apple = new MarketAsset();
        apple.setSymbol("AAPL");
        apple.setName("Apple Inc.");
        apple.setType("STOCK");
        apple.setLogoUrl("https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg");

        MarketAsset tesla = new MarketAsset();
        tesla.setSymbol("TSLA");
        tesla.setName("Tesla Inc.");
        tesla.setType("STOCK");
        tesla.setLogoUrl("https://upload.wikimedia.org/wikipedia/commons/e/e8/Tesla_logo.png");

        // 2. CRYPTO
        MarketAsset btc = new MarketAsset();
        btc.setSymbol("BINANCE:BTCUSDT"); // Simbolo specifico per Finnhub
        btc.setName("Bitcoin");
        btc.setType("CRYPTO");
        btc.setLogoUrl("https://upload.wikimedia.org/wikipedia/commons/4/46/Bitcoin.svg");

        MarketAsset eth = new MarketAsset();
        eth.setSymbol("BINANCE:ETHUSDT");
        eth.setName("Ethereum");
        eth.setType("CRYPTO");
        eth.setLogoUrl("https://upload.wikimedia.org/wikipedia/commons/0/05/Ethereum_logo_2014.svg");

        // 3. FOREX (Valute)
        MarketAsset eurUsd = new MarketAsset();
        eurUsd.setSymbol("OANDA:EUR_USD");
        eurUsd.setName("EUR/USD");
        eurUsd.setType("FOREX");
        eurUsd.setLogoUrl("https://upload.wikimedia.org/wikipedia/commons/5/56/Flag_of_Europe.svg");

        // Salviamo tutto in un colpo solo
        repository.saveAll(Arrays.asList(apple, tesla, btc, eth, eurUsd));

        System.out.println("✅ Database popolato con successo!");
      } else {
        System.out.println("ℹ️ Database già popolato. Nessuna azione necessaria.");
      }
    };
  }
}
