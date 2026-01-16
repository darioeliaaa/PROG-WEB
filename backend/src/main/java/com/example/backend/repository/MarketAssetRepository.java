package com.example.backend.repository;

import com.example.backend.entity.MarketAsset;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MarketAssetRepository extends JpaRepository<MarketAsset, Long> {
}
