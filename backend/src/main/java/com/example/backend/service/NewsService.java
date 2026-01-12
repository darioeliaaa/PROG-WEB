package com.example.backend.service;

import com.example.backend.dto.NewsDTO;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class NewsService {

  // Inserisci la key in application.properties come: news.api.key=...
  @Value("${news.api.key}")
  private String apiKey;

  private final String NEWS_API_URL = "https://newsapi.org/v2/top-headlines?category=business&language=en&apiKey=";

  // Cache chiamata "market-news", dura finché non viene pulita
  @Cacheable("market-news")
  public NewsDTO getMarketNews() {
    RestTemplate restTemplate = new RestTemplate();
    String urlCompleto = NEWS_API_URL + apiKey;

    // 1. STAMPA L'URL (Così controlli se la KEY è attaccata giusta)
    System.out.println("--- DEBUG NEWS ---");
    System.out.println("Chiamando URL: " + urlCompleto);

    try {
      NewsDTO risposta = restTemplate.getForObject(urlCompleto, NewsDTO.class);

      // 2. STAMPA COSA RISPONDE L'API
      if (risposta != null && risposta.getArticles() != null) {
        System.out.println("Articoli trovati: " + risposta.getArticles().size());
      } else {
        System.out.println("Risposta NULL o lista vuota!");
      }

      return risposta;
    } catch (Exception e) {
      // 3. STAMPA L'ERRORE SE C'È
      System.err.println("ERRORE API: " + e.getMessage());
      e.printStackTrace();
      return new NewsDTO();
    }
  }
}
