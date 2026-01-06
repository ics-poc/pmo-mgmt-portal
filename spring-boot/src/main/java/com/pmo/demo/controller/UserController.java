package com.pmo.demo.controller;

import java.sql.Timestamp;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.pmo.demo.domain.LoginRequest;
import com.pmo.demo.entity.TempLoginToken;
import com.pmo.demo.entity.UserEntity;
import com.pmo.demo.repository.TempLoginTokenRepository;
import com.pmo.demo.service.TempLoginService;
import com.pmo.demo.service.UserService;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
@RequestMapping("/auth")
public class UserController {

	@Autowired
    private UserService userService;
	
    @Autowired
    private TempLoginService tempLoginService;

    @Autowired
    private TempLoginTokenRepository tokenRepository;
    
    @PostMapping("/login")
    public UserEntity login(@RequestBody LoginRequest loginRequest) {

        return userService.login(
                loginRequest.getUsername(),
                loginRequest.getPassword()
        );
    }

    @PostMapping("/create-temp-url")
    public ResponseEntity<String> createTempUrl(
            @RequestParam String email,
            @RequestParam String redirectPath
    ) {
        tempLoginService.createTempLoginLink(email, redirectPath);
        return ResponseEntity.ok("Mail sent");
    }

    @GetMapping("/temp-login")
    public ResponseEntity<?> validateTempLogin(@RequestParam String token) {

        TempLoginToken tok = tokenRepository.findByToken(token);

        if (tok == null) {
            return ResponseEntity.badRequest().body("Invalid link");
        }

        if (tok.getExpiresAt().before(new Timestamp(System.currentTimeMillis()))) {
            return ResponseEntity.badRequest().body("Link expired");
        }

        return ResponseEntity.ok(Map.of(
                "email", tok.getEmail(),
                "redirectPath", tok.getRedirectPath()
        ));
    }
}
