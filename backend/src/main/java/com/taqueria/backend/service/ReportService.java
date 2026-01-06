package com.taqueria.backend.service;

import com.taqueria.backend.dto.SalesReportDTO;
import com.taqueria.backend.model.Order;
import com.taqueria.backend.model.OrderItem;
import com.taqueria.backend.model.OrderStatus;
import com.taqueria.backend.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ReportService {

    @Autowired
    private OrderRepository orderRepository;

    public List<SalesReportDTO> getSalesReport(LocalDate startDate, LocalDate endDate, List<String> categories,
            List<String> products) {
        List<Order> orders = orderRepository.findAll(); // In a real app, filter by date at DB level

        // Filter orders by date and status (only PAID or DELIVERED considered sales?)
        // Let's assume PAID for now, or all non-open?
        // Let's include all for now or filter by date range if provided
        if (startDate != null) {
            orders = orders.stream()
                    .filter(o -> o.getDate() != null && !o.getDate().toLocalDate().isBefore(startDate))
                    .collect(Collectors.toList());
        }
        if (endDate != null) {
            orders = orders.stream()
                    .filter(o -> o.getDate() != null && !o.getDate().toLocalDate().isAfter(endDate))
                    .collect(Collectors.toList());
        }

        List<SalesReportDTO> report = new ArrayList<>();

        // Flatten to OrderItems with date info
        var flattenedItems = orders.stream()
                .flatMap(order -> order.getItems().stream()
                        .map(item -> new ItemWithDate(order.getDate().toLocalDate(), item)))
                .collect(Collectors.toList());

        // Filter by Category and Product
        if (categories != null && !categories.isEmpty()) {
            flattenedItems = flattenedItems.stream()
                    .filter(wrapper -> wrapper.item.getProduct().getCategory() != null
                            && categories.contains(wrapper.item.getProduct().getCategory()))
                    .collect(Collectors.toList());
        }
        if (products != null && !products.isEmpty()) {
            flattenedItems = flattenedItems.stream()
                    .filter(wrapper -> products.contains(wrapper.item.getProduct().getName()))
                    .collect(Collectors.toList());
        }

        // Group by Date and Category
        Map<LocalDate, Map<String, List<ItemWithDate>>> grouped = flattenedItems.stream()
                .collect(Collectors.groupingBy(
                        w -> w.date,
                        Collectors.groupingBy(
                                w -> w.item.getProduct().getCategory() != null ? w.item.getProduct().getCategory()
                                        : "Uncategorized")));

        // Aggregate
        grouped.forEach((date, catMap) -> {
            catMap.forEach((category, items) -> {
                long quantity = items.stream().mapToLong(w -> w.item.getQuantity()).sum();
                double total = items.stream().mapToDouble(w -> w.item.getProduct().getPrice() * w.item.getQuantity())
                        .sum();
                report.add(new SalesReportDTO(date, category, quantity, total));
            });
        });

        return report;
    }

    private static class ItemWithDate {
        LocalDate date;
        OrderItem item;

        public ItemWithDate(LocalDate date, OrderItem item) {
            this.date = date;
            this.item = item;
        }
    }
}
