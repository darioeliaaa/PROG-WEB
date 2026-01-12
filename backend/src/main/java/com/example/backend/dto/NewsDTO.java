package com.example.backend.dto;

import lombok.Data;
import java.util.List;

@Data
public class NewsDTO {
  private String status;
  private List<ArticleDTO> articles;
}
