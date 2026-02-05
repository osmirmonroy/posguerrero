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

    @GetMapping("/summary")
    public DashboardSummaryDTO getDashboardSummary() {
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = LocalDate.now().atTime(LocalTime.MAX);

        // 1. Daily Sales Total (PAID orders today)
        // We can reuse the sumTotalByUserAndDateBetween but we need it for ALL users.
        // Or find all valid sales today and sum.
        // Let's create a quick stream calculation or repo query if simple.
        // Repo query is best but let's do stream for MVP speed if repo method doesn't
        // exist for "All Users".
        // Actually, let's create a repo method findByDateBetweenAndStatus

        // Fetching all paid orders today
        Double dailySales = orderRepository.findAll().stream()
                .filter(o -> o.getStatus() == OrderStatus.PAID &&
                        o.getDate() != null &&
                        !o.getDate().isBefore(startOfDay) &&
                        !o.getDate().isAfter(endOfDay))
                .mapToDouble(o -> o.getTotal() != null ? o.getTotal() : 0.0)
                .sum();

        // 2. Active Orders Count (OPEN, PREPARING, READY, REOPENED)
        Long activeOrders = orderRepository.findByStatusIn(Arrays.asList(
                OrderStatus.OPEN, OrderStatus.PREPARING, OrderStatus.READY, OrderStatus.REOPENED)).stream().count();

        // 3. Low Stock Items Count
        Long lowStockCount = (long) inventoryService.getLowStockSupplies().size();

        return new DashboardSummaryDTO(dailySales, activeOrders, lowStockCount);
    }
}
