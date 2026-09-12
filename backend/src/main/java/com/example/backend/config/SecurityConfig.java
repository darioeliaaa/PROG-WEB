package com.example.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

  // Origini ammesse in CORS: di default solo il dev server Angular locale.
  // Su Render, imposta la variabile d'ambiente CORS_ALLOWED_ORIGINS con
  // l'URL Vercel del frontend (più origini separate da virgola se servono,
  // es. "http://localhost:4200,https://moneymind.vercel.app").
  @Value("${cors.allowed-origins:http://localhost:4200}")
  private String allowedOrigins;

  @Bean
  public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
  }

  @Bean
  public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http
      .csrf(csrf -> csrf.disable()) // Disabilita CSRF per le API
      .cors(cors -> cors.configurationSource(corsConfigurationSource())) // ✅ USA LA CONFIGURAZIONE SOTTO
      .authorizeHttpRequests(auth -> auth
        // Rendi pubblici gli endpoint di autenticazione e reset password
        .requestMatchers("/api/users/**").permitAll()
        .requestMatchers("/api/news").permitAll()

        // Lascia aperto tutto il resto (per sviluppo)
        .anyRequest().permitAll()
      );
    return http.build();
  }

  // CONFIGURAZIONE CORS GLOBALE E ROBUSTA
  @Bean
  public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();

    // Consenti solo il/i frontend elencati in CORS_ALLOWED_ORIGINS
    configuration.setAllowedOrigins(
        Arrays.stream(allowedOrigins.split(","))
            .map(String::trim)
            .filter(origin -> !origin.isEmpty())
            .toList()
    );

    // Consenti tutti i metodi HTTP
    configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));

    configuration.setAllowedHeaders(List.of("*"));

    configuration.setAllowCredentials(true);

    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", configuration);
    return source;
  }
}
