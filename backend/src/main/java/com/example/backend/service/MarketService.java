package com.example.backend.service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.beans.factory.annotation.Value; // Import corretto di Spring
import java.util.Map;

@Service
public class MarketService {

  // 1. Dichiariamo la variabile (Spring inietterà qui il valore dal file properties)
  @Value("${finnhub.api.key}")
  private String API_KEY;

  private final String BASE_URL = "https://finnhub.io/api/v1/quote";

  public double getCurrentPrice(String symbol) {
    RestTemplate restTemplate = new RestTemplate();

    // 2. Ora possiamo usare API_KEY perché è dichiarata sopra
    String url = BASE_URL + "?symbol=" + symbol + "&token=" + API_KEY;

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
