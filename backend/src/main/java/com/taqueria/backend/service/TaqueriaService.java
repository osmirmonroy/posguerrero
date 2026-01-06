package com.taqueria.backend.service;

import com.taqueria.backend.model.Order;
import com.taqueria.backend.model.OrderStatus;
import com.taqueria.backend.model.Product;
import com.taqueria.backend.model.Extra;
import com.taqueria.backend.repository.ExtraRepository;
import com.taqueria.backend.repository.OrderRepository;
import com.taqueria.backend.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class TaqueriaService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ExtraRepository extraRepository;

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public Order createOrder(Order order) {
        order.setDate(LocalDateTime.now());
        if (order.getStatus() == null) {
            order.setStatus(OrderStatus.OPEN);
        }
        // Calculate total if not provided or verify it
        double total = 0;
        if (order.getItems() != null) {
            for (var item : order.getItems()) {
                item.setOrder(order);
                // In a real app, we should fetch product price from DB to avoid client-side
                // manipulation
                // For simplicity, assuming the client sends correct data or we trust it for
                // now,
                // but better to fetch price.
                Product p = productRepository.findById(item.getProduct().getId()).orElse(null);
                if (p != null) {
                    double itemPrice = p.getPrice();
                    if (item.getExtras() != null) {
                        for (var extra : item.getExtras()) {
                            Extra e = extraRepository.findById(extra.getId()).orElse(null);
                            if (e != null) {
                                itemPrice += e.getPrice();
                            }
                        }
                    }
                    total += itemPrice * item.getQuantity();
                }
            }
        }
        order.setTotal(total);
        return orderRepository.save(order);
    }

    public Order updateOrder(Long id, Order orderDetails) {
        Order order = orderRepository.findById(id).orElse(null);
        if (order != null) {
            if (orderDetails.getStatus() != null) {
                order.setStatus(orderDetails.getStatus());
            }
            if (orderDetails.getItems() != null && !orderDetails.getItems().isEmpty()) {
                // Logic to append items could be complex (merging), for simplicity we just add
                // new ones
                // In a real app, we might want to merge quantities if product exists
                for (var item : orderDetails.getItems()) {
                    item.setOrder(order);
                    order.getItems().add(item);
                }
                // Recalculate total
                double total = 0;
                for (var item : order.getItems()) {
                    Product p = productRepository.findById(item.getProduct().getId()).orElse(null);
                    if (p != null) {
                        double itemPrice = p.getPrice();
                        if (item.getExtras() != null) {
                            for (var extra : item.getExtras()) {
                                Extra e = extraRepository.findById(extra.getId()).orElse(null);
                                if (e != null) {
                                    itemPrice += e.getPrice();
                                }
                            }
                        }
                        total += itemPrice * item.getQuantity();
                    }
                }
                order.setTotal(total);
            }
            return orderRepository.save(order);
        }
        return null;
    }

    public List<Order> getOrdersByTable(Integer tableNumber) {
        // This requires a custom query in Repository, or filtering here.
        // For simplicity/performance, let's filter here or add method to repo.
        // Let's add method to repo in next step.
        return orderRepository.findByTableNumberAndStatus(tableNumber, OrderStatus.OPEN);
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    public Product saveProduct(Product product) {
        return productRepository.save(product);
    }

    public void deleteProduct(Long id) {
        productRepository.deleteById(id);
    }

    public List<Extra> getAllExtras() {
        return extraRepository.findAll();
    }

    public Extra saveExtra(Extra extra) {
        return extraRepository.save(extra);
    }

    public void deleteExtra(Long id) {
        extraRepository.deleteById(id);
    }
}
