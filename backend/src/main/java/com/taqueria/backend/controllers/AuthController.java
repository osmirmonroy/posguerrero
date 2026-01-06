package com.taqueria.backend.controllers;

import com.taqueria.backend.dto.AuthRequest;
import com.taqueria.backend.dto.AuthResponse;
import com.taqueria.backend.models.User;
import com.taqueria.backend.repositories.UserRepository;
import com.taqueria.backend.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

        private final AuthenticationManager authenticationManager;
        private final UserRepository userRepository;
        private final JwtService jwtService;
        private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(AuthController.class);

        @PostMapping("/login")
        public ResponseEntity<AuthResponse> login(@RequestBody AuthRequest request) {
                logger.info("AuthController: Login attempt for user: {}", request.getUsername());

                authenticationManager.authenticate(
                                new UsernamePasswordAuthenticationToken(
                                                request.getUsername(),
                                                request.getPassword()));
                var user = userRepository.findByUsername(request.getUsername())
                                .orElseThrow();
                var jwtToken = jwtService.generateToken(user);
                return ResponseEntity.ok(AuthResponse.builder()
                                .token(jwtToken)
                                .role(user.getRole())
                                .build());
        }
}
