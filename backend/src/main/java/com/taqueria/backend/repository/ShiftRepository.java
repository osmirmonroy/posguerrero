package com.taqueria.backend.repository;

import com.taqueria.backend.model.Shift;
import com.taqueria.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.List;

public interface ShiftRepository extends JpaRepository<Shift, Long> {
    Optional<Shift> findByUserAndStatus(User user, String status);

    List<Shift> findByStatus(String status);
}
