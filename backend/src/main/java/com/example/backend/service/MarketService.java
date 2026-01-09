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

  // Aggiungiamo il repository per leggere la lista degli asset da mostrare
  @Autowired
  private MarketAssetRepository assetRepository;

  // NOTA: Ho tolto "/quote" dalla fine perché ora ci serve chiamare anche "/stock/candle"
  private final String BASE_URL = "https://finnhub.io/api/v1";

  // ----------------------------------------------------------------
  // 1. METODO VECCHIO (Serve al tuo Portafoglio Personale)
  // ----------------------------------------------------------------
  public double getCurrentPrice(String symbol) {
    RestTemplate restTemplate = new RestTemplate();
    // Aggiornato URL perché BASE_URL ora è più corto
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

  // ----------------------------------------------------------------
  // 2. METODI NUOVI (Servono per la Dashboard Mercato del tuo collega)
  // ----------------------------------------------------------------

  // A. Lista per le colonne (Aziende, Crypto, Valute)
  public List<AssetQuoteDTO> getDashboardAssets() {
    List<MarketAsset> assets = assetRepository.findAll();
    List<AssetQuoteDTO> result = new ArrayList<>();
    RestTemplate restTemplate = new RestTemplate();

    for (MarketAsset asset : assets) {
      String url = BASE_URL + "/quote?symbol=" + asset.getSymbol() + "&token=" + API_KEY;

      try {
        Map<String, Object> response = restTemplate.getForObject(url, Map.class);

        if (response != null && response.get("c") != null) {
          double price = Double.parseDouble(response.get("c").toString());
          // 'dp' è la variazione percentuale (Delta Percent)
          double change = Double.parseDouble(response.get("dp").toString());

          result.add(new AssetQuoteDTO(
            asset.getSymbol(),
            asset.getName(),
            price,
            change,
            asset.getType(),
            asset.getLogoUrl()
          ));
        }
      } catch (Exception e) {
        System.out.println("Errore dashboard per " + asset.getSymbol());
      }
    }
    return result;
  }

  // B. Dati storici per il grafico
  public Map<String, Object> getAssetHistory(String symbol) {
    RestTemplate restTemplate = new RestTemplate();
    long to = System.currentTimeMillis() / 1000;
    long from = to - (86400 * 30); // Ultimi 30 giorni

    String url = BASE_URL + "/stock/candle?symbol=" + symbol + "&resolution=D&from=" + from + "&to=" + to + "&token=" + API_KEY;

    try {
      return restTemplate.getForObject(url, Map.class);
    } catch (Exception e) {
      return null;
    }
  }
  // Metodo per grafico DETTAGLIATO (Intraday - Ultime 24 ore)
  public Map<String, Object> getIntradayHistory(String symbol) {
    RestTemplate restTemplate = new RestTemplate();

    long to = System.currentTimeMillis() / 1000; // Adesso
    long from = to - (86400); // Esattamente 24 ore fa (86400 secondi)

    // CAMBIAMENTO CHIAVE: resolution=15 (dati ogni 15 minuti) invece di D
    String url = BASE_URL + "/stock/candle?symbol=" + symbol + "&resolution=15&from=" + from + "&to=" + to + "&token=" + API_KEY;

    try {
      return restTemplate.getForObject(url, Map.class);
    } catch (Exception e) {
      return null;
    }
  }
}
