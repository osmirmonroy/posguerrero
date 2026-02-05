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

        if ("OUT".equals(type) && supply.getStock() < quantity) {
            throw new RuntimeException("Insufficient stock");
        }

        // Update Stock
        if ("IN".equals(type)) {
            supply.setStock(supply.getStock() + quantity);
        } else if ("OUT".equals(type)) {
            supply.setStock(supply.getStock() - quantity);
        }
        supplyRepository.save(supply);

        // Record Transaction
        InventoryTransaction transaction = new InventoryTransaction();
        transaction.setSupply(supply);
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
    public List<Supply> getLowStockSupplies() {
        // Find supplies where stock is less than minStock (using a custom method or
        // filter)
        // Since we didn't add the custom query in repo properly to match "stock <
        // minStock" field vs field comparison
        // We will fetch all and filter in memory for simplicity unless we used @Query
        // Actually I added findByStockLessThan in repo but that takes a param, not
        // compares columns
        // Let's rely on getAll and filter or simple param check
        // For accurate column comparison "stock < min_stock", we need @Query.
        // Let's stick to simple param check if finding "critical items below X" or just
        // iterate.
        // Iterating is safer for now without custom JPQL writing.
        return supplyRepository.findAll().stream()
                .filter(s -> s.getMinStock() != null && s.getStock() <= s.getMinStock())
                .toList();
    }
}
