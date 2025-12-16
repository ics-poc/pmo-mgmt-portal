package com.pmo.demo.serviceImpl;

import java.sql.Timestamp;
import java.time.Duration;
import java.time.Instant;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.pmo.demo.entity.TempLoginToken;
import com.pmo.demo.repository.TempLoginTokenRepository;
import com.pmo.demo.service.TempLoginService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TempLoginServiceImpl implements TempLoginService{

	@Autowired
    private TempLoginTokenRepository tokenRepository;

	@Override
    public String createTempLoginLink(String email) {

        String token = UUID.randomUUID().toString();

        TempLoginToken tokenEntity = new TempLoginToken();
        tokenEntity.setEmail(email);
        tokenEntity.setToken(token);

        tokenEntity.setExpiresAt(
                Timestamp.from(Instant.now().plus(Duration.ofMinutes(30)))
        );

        tokenRepository.save(tokenEntity);

        return "https://yourapp.com/temp-login?token=" + token;
    }
}
