package com.taqueria.backend.repository;

import com.taqueria.backend.model.CashCut;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CashCutRepository extends JpaRepository<CashCut, Long> {
}
