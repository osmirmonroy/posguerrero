package com.taqueria.backend.controller;

import com.taqueria.backend.dto.DashboardSummaryDTO;
import com.taqueria.backend.repository.OrderRepository;
import com.taqueria.backend.service.InventoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.taqueria.backend.model.OrderStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Arrays;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

        @Autowired
        private OrderRepository orderRepository;

        @Autowired
        private InventoryService inventoryService;

        @Autowired
        private com.taqueria.backend.repository.UserRepository userRepository;

        @GetMapping("/summary")
        public DashboardSummaryDTO getDashboardSummary(
                        @org.springframework.web.bind.annotation.RequestParam(required = false) Long branchId,
                        java.security.Principal principal) {
                LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
                LocalDateTime endOfDay = LocalDate.now().atTime(LocalTime.MAX);

                com.taqueria.backend.model.User user = userRepository.findByUsername(principal.getName()).orElseThrow();

                // 1. Daily Sales Total (PAID orders today)
                // If user is branch restricted, filter by branch.
                // For now, let's filter by user's branch if present.
                // But dashboard is usually for the shop.
                // We will improve this later. Use repository filter if we added one.
                // Current repo findAll() gets everything.
                // Let's assume global for now or refactor Dashboard later for full multi-branch
                // filtering.
                // But for Low Stock, we MUST pass userId.

                Double dailySales = orderRepository.findAllByIsActiveTrue().stream()
                                .filter(o -> o.getStatus() == OrderStatus.PAID &&
                                                o.getDate() != null &&
                                                !o.getDate().isBefore(startOfDay) &&
                                                !o.getDate().isAfter(endOfDay) &&
                                                (branchId == null || (o.getBranch() != null
                                                                && o.getBranch().getId().equals(branchId))))
                                .mapToDouble(o -> o.getTotal() != null ? o.getTotal() : 0.0)
                                .sum();

                // 2. Active Orders Count (OPEN, PREPARING, READY, REOPENED)
                Long activeOrders = orderRepository.findByStatusInAndIsActiveTrue(Arrays.asList(
                                OrderStatus.OPEN, OrderStatus.PREPARING, OrderStatus.READY, OrderStatus.REOPENED))
                                .stream()
                                .filter(o -> branchId == null
                                                || (o.getBranch() != null && o.getBranch().getId().equals(branchId)))
                                .count();

                // 3. Low Stock Items Count
                Long lowStockCount = (long) inventoryService.getLowStockSupplies(user.getId(), branchId).size();

                return new DashboardSummaryDTO(dailySales, activeOrders, lowStockCount);
        }
}
