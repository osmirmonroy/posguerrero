package com.taqueria.backend.repository;

import com.taqueria.backend.model.InventoryTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface InventoryTransactionRepository extends JpaRepository<InventoryTransaction, Long> {
    List<InventoryTransaction> findBySupplyIdOrderByDateDesc(Long supplyId);
}
