package com.taqueria.backend.repository;

import com.taqueria.backend.model.BranchSupply;
import com.taqueria.backend.model.Branch;
import com.taqueria.backend.model.Supply;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;

@Repository
public interface BranchSupplyRepository extends JpaRepository<BranchSupply, Long> {
    Optional<BranchSupply> findByBranchAndSupply(Branch branch, Supply supply);

    List<BranchSupply> findByBranch(Branch branch);
}
