package com.pmo.demo.serviceImpl;

import java.sql.Timestamp;
import java.time.Duration;
import java.time.Instant;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.pmo.demo.entity.TempLoginToken;
import com.pmo.demo.repository.TempLoginTokenRepository;
import com.pmo.demo.service.EmailService;
import com.pmo.demo.service.TempLoginService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class TempLoginServiceImpl implements TempLoginService{

	private final TempLoginTokenRepository tokenRepository;
    private final EmailService emailService;

    @Override
    public void createTempLoginLink(String email, String redirectPath) {

        if (redirectPath == null || !redirectPath.startsWith("/")) {
            throw new IllegalArgumentException("Invalid redirect path");
        }

        String token = UUID.randomUUID().toString();

        TempLoginToken entity = new TempLoginToken();
        entity.setEmail(email);
        entity.setToken(token);
        entity.setRedirectPath(redirectPath);
        entity.setExpiresAt(
            Timestamp.from(Instant.now().plus(Duration.ofMinutes(30)))
        );

        tokenRepository.save(entity);

        String link = "http://localhost:3000/temp-login?token=" + token;

        try {
            emailService.sendMagicLink(email, link);
        } catch (Exception e) {
            log.error("Email sending failed, token still created", e);
        }
    }
}
