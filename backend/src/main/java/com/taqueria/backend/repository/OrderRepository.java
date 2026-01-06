package com.taqueria.backend.repository;

import com.taqueria.backend.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;

import com.taqueria.backend.model.OrderStatus;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByTableNumberAndStatus(Integer tableNumber, OrderStatus status);
}
