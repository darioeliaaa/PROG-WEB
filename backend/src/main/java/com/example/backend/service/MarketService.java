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

  // ✅ 1. LA MEMORIA CACHE (Fondamentale!)
  private List<AssetQuoteDTO> cachedData = new ArrayList<>();

  // ----------------------------------------------------------------
  // METODO DASHBOARD (Blindato con Cache)
  // ----------------------------------------------------------------
  public List<AssetQuoteDTO> getDashboardAssets(boolean forceRefresh) {

    // ✅ CONTROLLO DI SICUREZZA
    // Se ho dati in memoria E tu NON hai premuto "Aggiorna"...
    if (!cachedData.isEmpty() && !forceRefresh) {
      System.out.println("🛡️ RISPARMIO API: Uso i dati in memoria (0 chiamate a Finnhub)");
      return cachedData; // Restituisco subito la lista vecchia!
    }

    // 🔄 SCARICAMENTO REALE (Solo se necessario)
    System.out.println("🌍 CHIAMATA API: Sto scaricando nuovi dati da Finnhub...");

    List<MarketAsset> assets = assetRepository.findAll();
    List<AssetQuoteDTO> newData = new ArrayList<>();
    RestTemplate restTemplate = new RestTemplate();

    for (MarketAsset asset : assets) {
      String url = BASE_URL + "/quote?symbol=" + asset.getSymbol() + "&token=" + API_KEY;
      try {
        Map<String, Object> response = restTemplate.getForObject(url, Map.class);
        if (response != null && response.get("c") != null) {
          double price = Double.parseDouble(response.get("c").toString());
          double change = Double.parseDouble(response.get("dp").toString());

          newData.add(new AssetQuoteDTO(
            asset.getSymbol(), asset.getName(), price, change, asset.getType(), asset.getLogoUrl()
          ));
        }
      } catch (Exception e) {
        System.out.println("⚠️ Errore API per " + asset.getSymbol() + ": " + e.getMessage());
      }
    }

    // ✅ SALVATAGGIO IN MEMORIA
    if (!newData.isEmpty()) {
      this.cachedData = newData; // Aggiorno la cache con i dati nuovi
      System.out.println("✅ Cache aggiornata con successo (" + newData.size() + " asset)!");
    } else {
      System.out.println("⚠️ Recupero fallito, restituisco i vecchi dati per non rompere la pagina.");
      return this.cachedData;
    }

    return newData;
  }

  // ----------------------------------------------------------------
  // DATI STORICI (Grafico Intraday - Ultime 24 ore)
  // ----------------------------------------------------------------
  public Map<String, Object> getIntradayHistory(String symbol) {
    RestTemplate restTemplate = new RestTemplate();

    long to = System.currentTimeMillis() / 1000; // Adesso
    long from = to - (86400); // Esattamente 24 ore fa (86400 secondi)

    // resolution=15 (dati ogni 15 minuti)
    String url = BASE_URL + "/stock/candle?symbol=" + symbol + "&resolution=15&from=" + from + "&to=" + to + "&token=" + API_KEY;

    try {
      return restTemplate.getForObject(url, Map.class);
    } catch (Exception e) {
      return null;
    }
  }

  // ----------------------------------------------------------------
  // METODO VECCHIO (Portafoglio Personale)
  // ----------------------------------------------------------------
  public double getCurrentPrice(String symbol) {
    RestTemplate restTemplate = new RestTemplate();
    String url = BASE_URL + "/quote?symbol=" + symbol + "&token=" + API_KEY;
    try {
      Map<String, Object> response = restTemplate.getForObject(url, Map.class);
      if (response != null && response.get("c") != null) {
        return Double.parseDouble(response.get("c").toString());
      }
    } catch (Exception e) {
      System.out.println("Errore recupero dati per " + symbol + ": " + e.getMessage());
    }
    return 0.0;
  }
}
