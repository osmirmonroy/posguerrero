package com.taqueria.backend.controller;

import com.taqueria.backend.model.InventoryTransaction;
import com.taqueria.backend.model.Supplier;
import com.taqueria.backend.model.Supply;
import com.taqueria.backend.service.InventoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import com.taqueria.backend.model.User;
import com.taqueria.backend.repository.UserRepository;
import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/inventory")
public class InventoryController {

    @Autowired
    private InventoryService inventoryService;

    @Autowired
    private UserRepository userRepository;

    // Suppliers
    @GetMapping("/suppliers")
    public List<Supplier> getAllSuppliers() {
        return inventoryService.getAllSuppliers();
    }

    @PostMapping("/suppliers")
    public Supplier createSupplier(@RequestBody Supplier supplier) {
        return inventoryService.saveSupplier(supplier);
    }

    @PutMapping("/suppliers/{id}")
    public Supplier updateSupplier(@PathVariable Long id, @RequestBody Supplier supplier) {
        supplier.setId(id);
        return inventoryService.saveSupplier(supplier);
    }

    @DeleteMapping("/suppliers/{id}")
    public void deleteSupplier(@PathVariable Long id) {
        inventoryService.deleteSupplier(id);
    }

    // Supplies
    @GetMapping("/supplies")
    public List<Supply> getAllSupplies(@RequestParam(required = false) Long branchId) {
        return inventoryService.getAllSupplies(branchId);
    }

    @PostMapping("/supplies")
    public Supply createSupply(@RequestBody Supply supply) {
        return inventoryService.saveSupply(supply);
    }

    @PutMapping("/supplies/{id}")
    public Supply updateSupply(@PathVariable Long id, @RequestBody Supply supply) {
        supply.setId(id);
        return inventoryService.saveSupply(supply);
    }

    @DeleteMapping("/supplies/{id}")
    public void deleteSupply(@PathVariable Long id) {
        inventoryService.deleteSupply(id);
    }

    // Transactions
    @PostMapping("/transactions")
    public InventoryTransaction addTransaction(@RequestBody java.util.Map<String, Object> payload,
            Principal principal) {
        User user = userRepository.findByUsername(principal.getName()).orElseThrow();
        Long supplyId = Long.valueOf(payload.get("supplyId").toString());
        String type = (String) payload.get("type");
        Double quantity = Double.valueOf(payload.get("quantity").toString());
        String reason = (String) payload.get("reason");

        return inventoryService.addTransaction(supplyId, type, quantity, reason, user.getId());
    }

    @GetMapping("/transactions/supply/{supplyId}")
    public List<InventoryTransaction> getTransactions(@PathVariable Long supplyId) {
        return inventoryService.getTransactionsBySupply(supplyId);
    }

    // Alerts
    @GetMapping("/alerts")
    public List<com.taqueria.backend.model.BranchSupply> getLowStockAlerts(
            @RequestParam(required = false) Long branchId,
            Principal principal) {
        User user = userRepository.findByUsername(principal.getName()).orElseThrow();
        return inventoryService.getLowStockSupplies(user.getId(), branchId);
    }
}
