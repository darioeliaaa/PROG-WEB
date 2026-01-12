package com.example.backend.scheduler;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class NewsCacheScheduler {

  // Svuota la cache ogni 30 minuti (1.800.000 ms)
  @CacheEvict(value = "market-news", allEntries = true)
  @Scheduled(fixedRate = 1800000)
  public void clearNewsCache() {
    System.out.println("Cache notizie svuotata. Al prossimo refresh verranno scaricate nuove news.");
  }
}
