package com.taqueria.backend.repository;

import com.taqueria.backend.model.Supply;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SupplyRepository extends JpaRepository<Supply, Long> {
    List<Supply> findByStockLessThan(Double minStock);

    List<Supply> findByStockLessThanEqual(Double stockLevel);
}
