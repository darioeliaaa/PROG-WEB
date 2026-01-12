package com.example.backend.service;

import com.example.backend.dto.AssetQuoteDTO;
import com.example.backend.entity.MarketAsset;
import com.example.backend.repository.MarketAssetRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class MarketService {

  @Value("${finnhub.api.key}")
  private String API_KEY;

  @Autowired
  private MarketAssetRepository assetRepository;

  private final String BASE_URL = "https://finnhub.io/api/v1";
  private final RestTemplate restTemplate = new RestTemplate();

  // ✅ 1. LA MEMORIA CACHE
  private List<AssetQuoteDTO> cachedData = new ArrayList<>();

  // ----------------------------------------------------------------
  // METODO DASHBOARD (Blindato con Cache + Dati Ricchi)
  // ----------------------------------------------------------------
  public List<AssetQuoteDTO> getDashboardAssets(boolean forceRefresh) {

    // ✅ CONTROLLO CACHE
    if (!cachedData.isEmpty() && !forceRefresh) {
      System.out.println("🛡️ RISPARMIO API: Uso dati in memoria");
      return cachedData;
    }

    System.out.println("🌍 CHIAMATA API: Scarico dati completi (Prezzi + Fondamentali)...");

    List<MarketAsset> assets = assetRepository.findAll();
    List<AssetQuoteDTO> newData = new ArrayList<>();

    for (MarketAsset asset : assets) {
      try {
        // --- 1. CHIAMATA PREZZI (/quote) ---
        String quoteUrl = String.format("%s/quote?symbol=%s&token=%s", BASE_URL, asset.getSymbol(), API_KEY);
        FinnhubQuote quote = restTemplate.getForObject(quoteUrl, FinnhubQuote.class);

        // --- 2. CHIAMATA PROFILO (/stock/profile2) ---
        String profileUrl = String.format("%s/stock/profile2?symbol=%s&token=%s", BASE_URL, asset.getSymbol(), API_KEY);
        FinnhubProfile profile = null;
        try {
          profile = restTemplate.getForObject(profileUrl, FinnhubProfile.class);
        } catch (Exception ex) {
          System.out.println("⚠️ Profilo non trovato per " + asset.getSymbol());
        }

        // --- 3. MERGE DEI DATI ---
        if (quote != null) {
          AssetQuoteDTO dto = new AssetQuoteDTO();

          // Dati Base
          dto.setSymbol(asset.getSymbol());
          dto.setType(asset.getType());

          // Default dal DB
          dto.setName(asset.getName());
          dto.setLogoUrl(asset.getLogoUrl());

          // Dati Prezzo Live
          dto.setCurrentPrice(quote.c);
          dto.setChangeValue(quote.d);
          dto.setChangePercent(quote.dp);
          dto.setHighPrice(quote.h);
          dto.setLowPrice(quote.l);
          dto.setOpenPrice(quote.o);
          dto.setPrevClosePrice(quote.pc);

          // Dati Profilo (Se disponibili sovrascrivono/arricchiscono)
          if (profile != null) {
            if (profile.name != null) dto.setName(profile.name);
            if (profile.logo != null && !profile.logo.isEmpty()) dto.setLogoUrl(profile.logo);

            dto.setMarketCap(profile.marketCapitalization);
            dto.setIndustry(profile.finnhubIndustry);
            dto.setCurrency(profile.currency);
          }

          newData.add(dto);
        }

      } catch (Exception e) {
        System.out.println("⚠️ Errore API per " + asset.getSymbol() + ": " + e.getMessage());
      }
    }

    // ✅ AGGIORNAMENTO CACHE
    if (!newData.isEmpty()) {
      this.cachedData = newData;
      System.out.println("✅ Cache aggiornata (" + newData.size() + " asset)!");
    } else {
      System.out.println("⚠️ Recupero fallito, uso vecchia cache.");
      return this.cachedData;
    }

    return newData;
  }

  // ----------------------------------------------------------------
  // DATI STORICI (Grafico Intraday)
  // ----------------------------------------------------------------
  public Map<String, Object> getIntradayHistory(String symbol) {
    long to = System.currentTimeMillis() / 1000;
    long from = to - (86400); // 24 ore fa
    String url = BASE_URL + "/stock/candle?symbol=" + symbol + "&resolution=15&from=" + from + "&to=" + to + "&token=" + API_KEY;
    try {
      return restTemplate.getForObject(url, Map.class);
    } catch (Exception e) {
      return null;
    }
  }

  // ----------------------------------------------------------------
  // UTILITY: Prezzo Singolo (usato da InvestmentService se serve)
  // ----------------------------------------------------------------
  public double getCurrentPrice(String symbol) {
    String url = String.format("%s/quote?symbol=%s&token=%s", BASE_URL, symbol, API_KEY);
    try {
      FinnhubQuote quote = restTemplate.getForObject(url, FinnhubQuote.class);
      return quote != null ? quote.c : 0.0;
    } catch (Exception e) {
      return 0.0;
    }
  }

  // ================================================================
  // CLASSI INTERNE PER MAPPARE IL JSON (Molto più pulito di Map<String, Object>)
  // ================================================================

  private static class FinnhubQuote {
    public double c;  // Current price
    public double d;  // Change
    public double dp; // Percent change
    public double h;  // High
    public double l;  // Low
    public double o;  // Open
    public double pc; // Previous close
  }

  private static class FinnhubProfile {
    public String name;
    public String logo;
    public String finnhubIndustry;
    public String currency;
    public double marketCapitalization;
    public double shareOutstanding;
  }
}
