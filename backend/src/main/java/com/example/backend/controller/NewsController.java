package com.example.backend.controller;

import com.example.backend.dto.ArticleDTO;
import com.example.backend.dto.NewsDTO;
import com.example.backend.service.NewsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/news")
@CrossOrigin(origins = "http://localhost:4200") // O l'URL del tuo frontend Angular
public class NewsController {

  @Autowired
  private NewsService newsService;

  @GetMapping
  public ResponseEntity<List<ArticleDTO>> getNews() {
    NewsDTO newsResponse = newsService.getMarketNews();
    if (newsResponse != null && newsResponse.getArticles() != null) {
      return ResponseEntity.ok(newsResponse.getArticles());
    }
    return ResponseEntity.noContent().build();
  }
}
