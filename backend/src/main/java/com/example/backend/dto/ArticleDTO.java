package com.example.backend.dto;

import lombok.Data;

@Data
public class ArticleDTO {
  private String title;
  private String url;
  private String urlToImage; // Utile per il frontend
  private SourceDTO source;

  @Data
  public static class SourceDTO {
    private String name;
  }
}
