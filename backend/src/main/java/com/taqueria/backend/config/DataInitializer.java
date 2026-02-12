package com.taqueria.backend.config;

import com.taqueria.backend.model.Role;
import com.taqueria.backend.model.User;
import com.taqueria.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@RequiredArgsConstructor
public class DataInitializer {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final com.taqueria.backend.repository.BranchRepository branchRepository;
    private final com.taqueria.backend.repository.BranchSupplyRepository branchSupplyRepository;
    private final com.taqueria.backend.repository.SupplyRepository supplyRepository;
    private final JdbcTemplate jdbcTemplate;

    @Bean
    public CommandLineRunner initData() {
        return args -> {
            // 0. Drop Check Constraint on users.role if exists (fix for new roles) and add
            // correct one
            try {
                // Find existing constraint that applies to 'role' column
                String constraintName = jdbcTemplate.query(
                        "SELECT TOP 1 K.name FROM sys.check_constraints C JOIN sys.columns L ON C.parent_column_id = L.column_id AND C.parent_object_id = L.object_id JOIN sys.key_constraints K ON C.name = K.name WHERE C.parent_object_id = OBJECT_ID('users') AND L.name = 'role'",
                        (rs, rowNum) -> rs.getString("name")).stream().findFirst().orElse(null);

                // For simple check constraints (not always key constraints)
                if (constraintName == null) {
                    constraintName = jdbcTemplate.query(
                            "SELECT name FROM sys.check_constraints WHERE parent_object_id = OBJECT_ID('users') AND definition LIKE '%role%'",
                            (rs, rowNum) -> rs.getString("name")).stream().findFirst().orElse(null);
                }

                if (constraintName != null) {
                    jdbcTemplate.execute("ALTER TABLE users DROP CONSTRAINT " + constraintName);
                    System.out.println("DataInitializer: Dropped outdated constraint: " + constraintName);
                }

                // Add new constraint ensuring roles are valid
                jdbcTemplate.execute(
                        "ALTER TABLE users ADD CONSTRAINT ck_users_role CHECK (role IN ('USER', 'ADMIN', 'COCINERO', 'GERENTE', 'MESERO'))");
                System.out.println("DataInitializer: Added updated constraint ck_users_role");

            } catch (Exception e) {
                // Constraint might already exist with this name or other error
                System.out.println("DataInitializer: Constraint update info: " + e.getMessage());
            }

            // 1. Create Default Branch if none exists
            com.taqueria.backend.model.Branch defaultBranch;
            if (branchRepository.count() == 0) {
                defaultBranch = com.taqueria.backend.model.Branch.builder()
                        .name("Sucursal Principal")
                        .location("Sede Central")
                        .isActive(true)
                        .build();
                defaultBranch = branchRepository.save(defaultBranch);
                System.out.println("DataInitializer: Created default branch 'Sucursal Principal'");
            } else {
                defaultBranch = branchRepository.findAll().get(0);
            }

            final com.taqueria.backend.model.Branch mainBranch = defaultBranch;

            // 2. Init Admin User
            String username = "admin";
            String password = "admin123";

            User admin = userRepository.findByUsername(username)
                    .orElse(User.builder()
                            .username(username)
                            .role(Role.ADMIN)
                            .build());

            admin.setPassword(passwordEncoder.encode(password));
            admin.setRole(Role.ADMIN);
            // Admin can be global (null branch) or assigned to main.
            // For checking purposes, let's leave admin global if it was already, or null.
            // But plan said "Assign all existing Users (without branch) to Branch 1".
            // Let's check other users.

            userRepository.save(admin);
            System.out.println("DataInitializer: Admin user 'admin' updated/created");

            // 3. Migrate Users (assign to default branch if null)
            java.util.List<User> usersWithoutBranch = userRepository.findAll().stream()
                    .filter(u -> u.getBranch() == null && u.getRole() != Role.ADMIN) // Skip global admin
                    .toList();

            if (!usersWithoutBranch.isEmpty()) {
                usersWithoutBranch.forEach(u -> u.setBranch(mainBranch));
                userRepository.saveAll(usersWithoutBranch);
                System.out
                        .println("DataInitializer: Assigned " + usersWithoutBranch.size() + " users to default branch");
            }

            // 4. Migrate Supply Stock to BranchSupply
            java.util.List<com.taqueria.backend.model.Supply> allSupplies = supplyRepository.findAll();
            for (com.taqueria.backend.model.Supply supply : allSupplies) {
                if (branchSupplyRepository.findByBranchAndSupply(mainBranch, supply).isEmpty()) {
                    com.taqueria.backend.model.BranchSupply branchSupply = com.taqueria.backend.model.BranchSupply
                            .builder()
                            .branch(mainBranch)
                            .supply(supply)
                            .stock(supply.getStock() != null ? supply.getStock() : 0.0)
                            .minStock(supply.getMinStock() != null ? supply.getMinStock() : 0.0)
                            .build();
                    branchSupplyRepository.save(branchSupply);
                }
            }
            System.out.println("DataInitializer: Migrated inventory to default branch");
        };
    }
}
