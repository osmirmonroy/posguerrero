package com.taqueria.backend.repository;

import com.taqueria.backend.model.Order;
import com.taqueria.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;

import com.taqueria.backend.model.OrderStatus;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
        List<Order> findByTableNumberAndStatus(Integer tableNumber, OrderStatus status);

        List<Order> findByStatusIn(List<OrderStatus> statuses);

        @Query("SELECT COALESCE(SUM(o.total), 0) FROM Order o WHERE o.user = :user AND o.status = 'PAID' AND o.date BETWEEN :startTime AND :endTime")
        Double sumTotalByUserAndDateBetween(@Param("user") User user, @Param("startTime") LocalDateTime startTime,
                        @Param("endTime") LocalDateTime endTime);

        @Query("SELECT new com.taqueria.backend.dto.TopProductDTO(i.product.name, SUM(i.quantity), SUM(i.quantity * i.product.price)) "
                        +
                        "FROM OrderItem i JOIN i.order o " +
                        "WHERE o.status = 'PAID' AND o.date BETWEEN :startTime AND :endTime " +
                        "GROUP BY i.product.name " +
                        "ORDER BY SUM(i.quantity) DESC")
        List<com.taqueria.backend.dto.TopProductDTO> findTopSellingProducts(@Param("startTime") LocalDateTime startTime,
                        @Param("endTime") LocalDateTime endTime);

        @Query("SELECT new com.taqueria.backend.dto.PaymentMethodStatsDTO(CAST(o.paymentMethod as string), COUNT(o), SUM(o.total)) "
                        +
                        "FROM Order o " +
                        "WHERE o.status = 'PAID' AND o.date BETWEEN :startTime AND :endTime " +
                        "GROUP BY o.paymentMethod")
        List<com.taqueria.backend.dto.PaymentMethodStatsDTO> findPaymentMethodStats(
                        @Param("startTime") LocalDateTime startTime, @Param("endTime") LocalDateTime endTime);

        // Fix for PaymentMethod enum query if needed:
        // Actually enum group by might need care. Using string representation or
        // dedicated query.
        // "KEY(o.paymentMethod)" works if it's a map? No, it's a field. Just
        // o.paymentMethod should work if enum to string conversion is automatic or use
        // name().
        // Let's try simple 'o.paymentMethod' first. Since we use
        // @Enumerated(EnumType.STRING), it's stored as string effectively.
        // However, Hibernate might return Enum object.
        // Let's coerce to string: CAST(o.paymentMethod as string) or just handle Enum
        // in DTO constructor if possible.
        // Simplest: "SELECT new ... (o.paymentMethod, ...)" and existing DTO takes Enum
        // or Object?
        // DTO takes String. "o.paymentMethod" passes Enum.
        // I'll update the query slightly to be safer.
}
