package com.taqueria.backend.controller;

import com.taqueria.backend.dto.AuthRequest;
import com.taqueria.backend.dto.AuthResponse;
import com.taqueria.backend.dto.TokenRefreshRequest;
import com.taqueria.backend.dto.TokenRefreshResponse;
import com.taqueria.backend.model.RefreshToken;
import com.taqueria.backend.repository.UserRepository;
import com.taqueria.backend.security.JwtService;
import com.taqueria.backend.service.RefreshTokenService;
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
        private final RefreshTokenService refreshTokenService;
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

                // Refresh Token Logic
                // We should invalidate old tokens or just create new one
                // Simple implementation: create new one
                RefreshToken refreshToken = refreshTokenService.createRefreshToken(user.getUsername());

                return ResponseEntity.ok(AuthResponse.builder()
                                .token(jwtToken)
                                .refreshToken(refreshToken.getToken())
                                .role(user.getRole())
                                .username(user.getUsername())
                                .branchName(user.getBranch() != null ? user.getBranch().getName() : null)
                                .build());
        }

        @PostMapping("/refresh")
        public ResponseEntity<TokenRefreshResponse> refreshToken(@RequestBody TokenRefreshRequest request) {
                String requestRefreshToken = request.getRefreshToken();

                return refreshTokenService.findByToken(requestRefreshToken)
                                .map(refreshTokenService::verifyExpiration)
                                .map(RefreshToken::getUser)
                                .map(user -> {
                                        String newToken = jwtService.generateToken(user);
                                        return ResponseEntity.ok(TokenRefreshResponse.builder()
                                                        .accessToken(newToken)
                                                        .refreshToken(requestRefreshToken)
                                                        .build());
                                })
                                .orElseThrow(() -> new RuntimeException("Refresh token is not in database!"));
        }
}
