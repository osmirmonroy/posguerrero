package com.taqueria.backend.repository;

import com.taqueria.backend.model.BranchProduct;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BranchProductRepository extends JpaRepository<BranchProduct, Long> {
    List<BranchProduct> findByBranchId(Long branchId);

    Optional<BranchProduct> findByBranchIdAndProductId(Long branchId, Long productId);

    List<BranchProduct> findByProductId(Long productId);

    void deleteByProductId(Long productId);
}
