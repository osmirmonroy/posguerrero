package com.taqueria.backend.config;

import com.taqueria.backend.model.Role;
import com.taqueria.backend.model.User;
import com.taqueria.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@RequiredArgsConstructor
public class DataInitializer {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Bean
    public CommandLineRunner initAdminUser() {
        return args -> {
            String username = "admin";
            String password = "admin123";

            User admin = userRepository.findByUsername(username)
                    .orElse(User.builder()
                            .username(username)
                            .role(Role.ADMIN)
                            .build());

            // Always update password to match expected value
            admin.setPassword(passwordEncoder.encode(password));
            admin.setRole(Role.ADMIN); // Ensure role is ADMIN

            userRepository.save(admin);
            System.out.println("DataInitializer: Admin user 'admin' updated/created with password 'admin123'");
        };
    }
}
