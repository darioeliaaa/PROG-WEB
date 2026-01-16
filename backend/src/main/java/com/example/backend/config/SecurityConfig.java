package com.example.backend.config;

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

  // ✅ CONFIGURAZIONE CORS GLOBALE E ROBUSTA
  @Bean
  public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();

    // Consenti solo il tuo Frontend Angular
    configuration.setAllowedOrigins(List.of("http://localhost:4200"));

    // Consenti tutti i metodi HTTP (fondamentale per il PUT/DELETE)
    configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));

    // Consenti tutti gli header (Authorization, Content-Type, ecc.)
    configuration.setAllowedHeaders(List.of("*"));

    // Importante per i cookie/token se ne userai in futuro
    configuration.setAllowCredentials(true);

    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", configuration);
    return source;
  }
}
