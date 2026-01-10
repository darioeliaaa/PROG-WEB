package com.example.backend.config;

import com.example.backend.entity.MarketAsset;
import com.example.backend.repository.MarketAssetRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.ArrayList;
import java.util.List;

@Configuration
public class DataInitializer {

  @Bean
  public CommandLineRunner loadData(MarketAssetRepository repository) {
    return args -> {
      // Carichiamo i dati solo se il DB è vuoto
      if (repository.count() == 0) {
        System.out.println("⚡ Inizializzazione Database: Caricamento MASSIVO Asset...");

        List<MarketAsset> assets = new ArrayList<>();

        // ==========================================
        // 🏢 AZIONI - TECH GIANTS (Big Tech)
        // ==========================================
        assets.add(create("AAPL", "Apple Inc.", "STOCK", "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg"));
        assets.add(create("MSFT", "Microsoft", "STOCK", "https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg"));
        assets.add(create("GOOGL", "Alphabet (Google)", "STOCK", "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg"));
        assets.add(create("AMZN", "Amazon", "STOCK", "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg"));
        assets.add(create("TSLA", "Tesla", "STOCK", "https://upload.wikimedia.org/wikipedia/commons/e/e8/Tesla_logo.png"));
        assets.add(create("NVDA", "NVIDIA", "STOCK", "https://upload.wikimedia.org/wikipedia/commons/2/21/Nvidia_logo.svg"));
        assets.add(create("META", "Meta (Facebook)", "STOCK", "https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg"));
        assets.add(create("NFLX", "Netflix", "STOCK", "https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg"));

        // ==========================================
        // 🏦 AZIONI - FINANCE & CONSUMER (Brand Famosi)
        // ==========================================
        assets.add(create("JPM", "JPMorgan Chase", "STOCK", "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/JPMorgan_Chase.svg/1200px-JPMorgan_Chase.svg.png"));
        assets.add(create("V", "Visa", "STOCK", "https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg"));
        assets.add(create("KO", "Coca-Cola", "STOCK", "https://upload.wikimedia.org/wikipedia/commons/c/ce/Coca-Cola_logo.svg"));
        assets.add(create("DIS", "Walt Disney", "STOCK", "https://upload.wikimedia.org/wikipedia/commons/3/3e/Disney%2B_logo.svg"));
        assets.add(create("NKE", "Nike", "STOCK", "https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg"));
        assets.add(create("MCD", "McDonald's", "STOCK", "https://upload.wikimedia.org/wikipedia/commons/3/36/McDonald%27s_Golden_Arches.svg"));

        // ==========================================
        // 🪙 CRIPTOVALUTE (Top Market Cap)
        // ==========================================
        assets.add(create("BINANCE:BTCUSDT", "Bitcoin", "CRYPTO", "https://upload.wikimedia.org/wikipedia/commons/4/46/Bitcoin.svg"));
        assets.add(create("BINANCE:ETHUSDT", "Ethereum", "CRYPTO", "https://upload.wikimedia.org/wikipedia/commons/0/05/Ethereum_logo_2014.svg"));
        assets.add(create("BINANCE:BNBUSDT", "Binance Coin", "CRYPTO", "https://upload.wikimedia.org/wikipedia/commons/f/fc/Binance-coin-bnb-logo.png"));
        assets.add(create("BINANCE:SOLUSDT", "Solana", "CRYPTO", "https://upload.wikimedia.org/wikipedia/en/b/b9/Solana_logo.png"));
        assets.add(create("BINANCE:XRPUSDT", "Ripple", "CRYPTO", "https://upload.wikimedia.org/wikipedia/commons/8/88/Ripple_logo.svg"));
        assets.add(create("BINANCE:ADAUSDT", "Cardano", "CRYPTO", "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/Cardano_Logo.svg/1200px-Cardano_Logo.svg.png"));
        assets.add(create("BINANCE:DOGEUSDT", "Dogecoin", "CRYPTO", "https://upload.wikimedia.org/wikipedia/en/d/d0/Dogecoin_Logo.png"));

        // ==========================================
        // 💶 FOREX (Valute Mondiali)
        // ==========================================
        // Nota: FXCM (FX) di solito è più stabile di OANDA su Finnhub Free
        assets.add(create("FX:EURUSD", "EUR / USD", "FOREX", "https://upload.wikimedia.org/wikipedia/commons/5/56/Flag_of_Europe.svg"));
        assets.add(create("FX:GBPUSD", "GBP / USD", "FOREX", "https://upload.wikimedia.org/wikipedia/commons/a/ae/Flag_of_the_United_Kingdom.svg"));
        assets.add(create("FX:USDJPY", "USD / JPY", "FOREX", "https://upload.wikimedia.org/wikipedia/en/9/9e/Flag_of_Japan.svg"));
        assets.add(create("FX:USDCHF", "USD / CHF", "FOREX", "https://upload.wikimedia.org/wikipedia/commons/f/f3/Flag_of_Switzerland.svg"));

        // Salviamo tutto
        repository.saveAll(assets);
        System.out.println("✅ POPOLAMENTO COMPLETATO: " + assets.size() + " asset inseriti nel database!");
      } else {
        System.out.println("ℹ️ Database già pieno. Salto il caricamento.");
      }
    };
  }

  // Metodo helper per tenere il codice pulito
  private MarketAsset create(String symbol, String name, String type, String logoUrl) {
    MarketAsset asset = new MarketAsset();
    asset.setSymbol(symbol);
    asset.setName(name);
    asset.setType(type);
    asset.setLogoUrl(logoUrl);
    return asset;
  }
}
