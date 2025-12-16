package com.pmo.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.pmo.demo.entity.TempLoginToken;

public interface TempLoginTokenRepository extends JpaRepository<TempLoginToken, Long> {
    TempLoginToken findByToken(String token);
}