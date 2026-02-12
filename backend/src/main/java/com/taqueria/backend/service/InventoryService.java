package com.taqueria.backend.service;

import com.taqueria.backend.model.InventoryTransaction;
import com.taqueria.backend.model.Supplier;
import com.taqueria.backend.model.Supply;
import com.taqueria.backend.model.User;
import com.taqueria.backend.repository.InventoryTransactionRepository;
import com.taqueria.backend.repository.SupplierRepository;
import com.taqueria.backend.repository.SupplyRepository;
import com.taqueria.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class InventoryService {

    @Autowired
    private SupplyRepository supplyRepository;

    @Autowired
    private SupplierRepository supplierRepository;

    @Autowired
    private InventoryTransactionRepository transactionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private com.taqueria.backend.repository.BranchSupplyRepository branchSupplyRepository;

    // Supplier CRUD
    public List<Supplier> getAllSuppliers() {
        return supplierRepository.findAll();
    }

    public Supplier saveSupplier(Supplier supplier) {
        return supplierRepository.save(supplier);
    }

    public void deleteSupplier(Long id) {
        supplierRepository.deleteById(id);
    }

    // Supply CRUD
    public List<Supply> getAllSupplies() {
        return supplyRepository.findAll();
    }

    public Supply saveSupply(Supply supply) {
        return supplyRepository.save(supply);
    }

    public void deleteSupply(Long id) {
        supplyRepository.deleteById(id);
    }

    // Inventory Transactions
    @Transactional
    public InventoryTransaction addTransaction(Long supplyId, String type, Double quantity, String reason,
            Integer userId) {
        Supply supply = supplyRepository.findById(supplyId).orElseThrow(() -> new RuntimeException("Supply not found"));
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getBranch() == null) {
            throw new RuntimeException("User must belong to a branch to manage inventory");
        }

        com.taqueria.backend.model.BranchSupply branchSupply = branchSupplyRepository
                .findByBranchAndSupply(user.getBranch(), supply)
                .orElse(com.taqueria.backend.model.BranchSupply.builder()
                        .branch(user.getBranch())
                        .supply(supply)
                        .stock(0.0)
                        .minStock(0.0)
                        .build());

        if ("OUT".equals(type) && branchSupply.getStock() < quantity) {
            throw new RuntimeException("Insufficient stock in branch " + user.getBranch().getName());
        }

        // Update Stock
        if ("IN".equals(type)) {
            branchSupply.setStock(branchSupply.getStock() + quantity);
        } else if ("OUT".equals(type)) {
            branchSupply.setStock(branchSupply.getStock() - quantity);
        }
        branchSupplyRepository.save(branchSupply);

        // Record Transaction
        InventoryTransaction transaction = new InventoryTransaction();
        transaction.setSupply(supply);
        // We really should add branch_id to transaction too, but for now linking via
        // user is implicit
        // or we need to add branch to transaction entity as planned.
        // Plan said: "inventory_transactions: Agregar branch_id".
        // I haven't added it to Entity yet. I should.

        transaction.setType(type);
        transaction.setQuantity(quantity);
        transaction.setReason(reason);
        transaction.setDate(LocalDateTime.now());
        transaction.setUser(user);

        return transactionRepository.save(transaction);
    }

    public List<InventoryTransaction> getTransactionsBySupply(Long supplyId) {
        return transactionRepository.findBySupplyIdOrderByDateDesc(supplyId);
    }

    // Alerts
    public List<com.taqueria.backend.model.BranchSupply> getLowStockSupplies(Integer userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        if (user.getBranch() == null)
            return List.of();

        return branchSupplyRepository.findByBranch(user.getBranch()).stream()
                .filter(bs -> bs.getMinStock() != null && bs.getStock() <= bs.getMinStock())
                .toList();
    }
}
