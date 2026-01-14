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
      if (repository.count() == 0) {
        System.out.println("⚡ Inizializzazione Database: Caricamento MASSIVO Asset HD...");

        List<MarketAsset> assets = new ArrayList<>();

        // ==========================================
        // 🏢 AZIONI - ICONE HD (Ottimizzate per cerchi)
        // ==========================================
        // Apple (Mela nera classica)
        assets.add(create("AAPL", "Apple Inc.", "STOCK", "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Apple_logo_black.svg/512px-Apple_logo_black.svg.png"));
        // Microsoft (I 4 quadrati colorati)
        assets.add(create("MSFT", "Microsoft", "STOCK", "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Microsoft_logo.svg/512px-Microsoft_logo.svg.png"));
        // Google (La G colorata)
        assets.add(create("GOOGL", "Alphabet (Google)", "STOCK", "https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Google_%22G%22_Logo.svg/512px-Google_%22G%22_Logo.svg.png"));
        // Amazon (L'icona con la freccia, non la scritta lunga)
        assets.add(create("AMZN", "Amazon", "STOCK", "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Amazon_icon.svg/512px-Amazon_icon.svg.png"));
        // Tesla (La T rossa)
        assets.add(create("TSLA", "Tesla", "STOCK", "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/Tesla_Motors.svg/512px-Tesla_Motors.svg.png"));
        // Nvidia (L'occhio verde)
        assets.add(create("NVDA", "NVIDIA", "STOCK", "https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Nvidia_logo.svg/512px-Nvidia_logo.svg.png"));
        // Meta (Il simbolo infinito blu)
        assets.add(create("META", "Meta", "STOCK", "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Meta_Platforms_Inc._logo.svg/512px-Meta_Platforms_Inc._logo.svg.png"));
        // Netflix (Solo la N rossa, molto più bella della scritta)
        assets.add(create("NFLX", "Netflix", "STOCK", "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Netflix_2015_N_logo.svg/512px-Netflix_2015_N_logo.svg.png"));

        // ==========================================
        // 🏦 AZIONI - FINANCE (Loghi Ufficiali)
        // ==========================================
        assets.add(create("JPM", "JPMorgan Chase", "STOCK", "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/JPMorgan_Chase.svg/512px-JPMorgan_Chase.svg.png"));
        assets.add(create("V", "Visa", "STOCK", "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/512px-Visa_Inc._logo.svg.png"));
        assets.add(create("KO", "Coca-Cola", "STOCK", "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/Coca-Cola_logo.svg/512px-Coca-Cola_logo.svg.png"));
        assets.add(create("DIS", "Walt Disney", "STOCK", "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Disney%2B_logo.svg/512px-Disney%2B_logo.svg.png"));
        assets.add(create("NKE", "Nike", "STOCK", "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Logo_NIKE.svg/512px-Logo_NIKE.svg.png"));
        assets.add(create("MCD", "McDonald's", "STOCK", "https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/McDonald%27s_Golden_Arches.svg/512px-McDonald%27s_Golden_Arches.svg.png"));

        // ==========================================
        // 🪙 CRIPTOVALUTE (CoinGecko CDN - Qualità Top)
        // ==========================================
        assets.add(create("BINANCE:BTCUSDT", "Bitcoin", "CRYPTO", "https://assets.coingecko.com/coins/images/1/large/bitcoin.png"));
        assets.add(create("BINANCE:ETHUSDT", "Ethereum", "CRYPTO", "https://assets.coingecko.com/coins/images/279/large/ethereum.png"));
        assets.add(create("BINANCE:BNBUSDT", "Binance Coin", "CRYPTO", "https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png"));
        assets.add(create("BINANCE:SOLUSDT", "Solana", "CRYPTO", "https://assets.coingecko.com/coins/images/4128/large/solana.png"));
        assets.add(create("BINANCE:XRPUSDT", "Ripple", "CRYPTO", "https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png"));
        assets.add(create("BINANCE:ADAUSDT", "Cardano", "CRYPTO", "https://assets.coingecko.com/coins/images/975/large/cardano.png"));
        assets.add(create("BINANCE:DOGEUSDT", "Dogecoin", "CRYPTO", "https://assets.coingecko.com/coins/images/5/large/dogecoin.png"));

        // ==========================================
        // 📊 ETF (Loghi Gestori HD)
        // ==========================================
        // State Street (SPY, GLD, DIA)
        // ... (Codice precedente per Azioni e Crypto invariato) ...

        // ==========================================
        // 📊 ETF - LOGHI BRAND UFFICIALI (HD PNG)
        // ==========================================

        // ... (Codice Azioni e Crypto resta uguale) ...

        // ==========================================
        // 📊 ETF - METODO INDISTRUTTIBILE (Google CDN)
        // Usiamo le icone ufficiali dai siti web dei gestori tramite Google
        // ==========================================

        // Base URL di Google per ottenere icone in alta risoluzione (size=256)
        String googleIconBase = "https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&size=256&url=";

        // Gestori
        String iconVanguard = "https://play-lh.googleusercontent.com/l-aJWfSH0IKc-D2rlChtAJ3WHKpqQha_bvbfUhc4z_8cejmCnypeOwVu-mvzYwI62Q=w240-h480-rw";
        String iconInvesco  = googleIconBase + "https://www.invesco.com";
        String iconIShares  = googleIconBase + "https://www.ishares.com";
        String iconArk      = googleIconBase + "https://ark-invest.com";
        // SPY, GLD, DIA -> State Street (SPDR)
        assets.add(create("SPY", "SPDR S&P 500 ETF", "ETF", "https://pbs.twimg.com/media/Foc5p55XEAMpKMe.png"));
        assets.add(create("GLD", "SPDR Gold Shares", "ETF", "https://s3-ap-southeast-1.amazonaws.com/files-tr8/stocks/gld-60d04c200628c.png"));
        assets.add(create("DIA", "SPDR Dow Jones Ind.", "ETF", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR1ebaMzf-gAKKUnpzjlsOqy6CID63k187q5Q&s"));

        // QQQ -> Invesco
        assets.add(create("QQQ", "Invesco QQQ Trust", "ETF", iconInvesco));

        // VTI, VOO -> Vanguard
        assets.add(create("VTI", "Vanguard Total Stock", "ETF", iconVanguard));
        assets.add(create("VOO", "Vanguard S&P 500", "ETF", iconVanguard));

        // IVV -> iShares (BlackRock)
        assets.add(create("IVV", "iShares Core S&P 500", "ETF", iconIShares));

        // ARKK -> ARK Invest
        assets.add(create("ARKK", "ARK Innovation ETF", "ETF", iconArk));

        repository.saveAll(assets);
        System.out.println("✅ POPOLAMENTO COMPLETATO: " + assets.size() + " asset inseriti!");
      } else {
        System.out.println("ℹ️ Database già pieno. Salto il caricamento.");
      }
    };
  }

  private MarketAsset create(String symbol, String name, String type, String logoUrl) {
    MarketAsset asset = new MarketAsset();
    asset.setSymbol(symbol);
    asset.setName(name);
    asset.setType(type);
    asset.setLogoUrl(logoUrl);
    return asset;
  }
}
