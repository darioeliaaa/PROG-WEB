package com.example.backend.service;

import com.example.backend.dto.NewsDTO;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class NewsService {

  @Value("${news.api.key}")
  private String apiKey;

  private final String NEWS_API_URL = "https://newsapi.org/v2/top-headlines?category=business&language=en&apiKey=";

  @Cacheable("market-news")
  public NewsDTO getMarketNews() {
    RestTemplate restTemplate = new RestTemplate();
    String urlCompleto = NEWS_API_URL + apiKey;

    System.out.println("--- DEBUG NEWS ---");
    System.out.println("Chiamando URL: " + urlCompleto);

    try {
      NewsDTO risposta = restTemplate.getForObject(urlCompleto, NewsDTO.class);

      if (risposta != null && risposta.getArticles() != null) {
        System.out.println("Articoli trovati: " + risposta.getArticles().size());
      } else {
        System.out.println("Risposta NULL o lista vuota!");
      }

      return risposta;
    } catch (Exception e) {
      System.err.println("ERRORE API: " + e.getMessage());
      e.printStackTrace();
      return new NewsDTO();
    }
  }
}
