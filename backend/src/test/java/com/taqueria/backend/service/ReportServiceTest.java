package com.taqueria.backend.service;

import com.taqueria.backend.dto.PaymentMethodStatsDTO;
import com.taqueria.backend.dto.SalesReportDTO;
import com.taqueria.backend.dto.TopProductDTO;
import com.taqueria.backend.model.Order;
import com.taqueria.backend.model.OrderItem;
import com.taqueria.backend.model.Product;
import com.taqueria.backend.repository.OrderRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

class ReportServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @InjectMocks
    private ReportService reportService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testGetTopSellingProducts() {
        when(orderRepository.findTopSellingProducts(any(LocalDateTime.class), any(LocalDateTime.class), any()))
                .thenReturn(Collections.singletonList(new TopProductDTO("Taco", 10L, 100.0)));

        List<TopProductDTO> result = reportService.getTopSellingProducts(LocalDate.now(), LocalDate.now(), null);

        assertNotNull(result);
        assertTrue(result.size() > 0);
    }

    @Test
    void testGetPaymentMethodStats() {
        when(orderRepository.findPaymentMethodStats(any(LocalDateTime.class), any(LocalDateTime.class), any()))
                .thenReturn(Collections.singletonList(new PaymentMethodStatsDTO("CASH", 5L, 50.0)));

        List<PaymentMethodStatsDTO> result = reportService.getPaymentMethodStats(LocalDate.now(), LocalDate.now(),
                null);

        assertNotNull(result);
        assertTrue(result.size() > 0);
    }

    @Test
    void testGetSalesReport() {
        Product product = new Product();
        product.setCategory("Tacos");
        product.setName("Pastor");
        product.setPrice(15.0);

        OrderItem item = new OrderItem();
        item.setProduct(product);
        item.setQuantity(2);

        Order order = new Order();
        order.setDate(LocalDateTime.now());
        order.setItems(Collections.singletonList(item));

        when(orderRepository.findAll()).thenReturn(Collections.singletonList(order));

        List<SalesReportDTO> result = reportService.getSalesReport(LocalDate.now().minusDays(1),
                LocalDate.now().plusDays(1), null, null, null);

        assertNotNull(result);
        assertTrue(result.size() > 0);
        assertEquals("Tacos", result.get(0).getCategory());
        assertEquals(2L, result.get(0).getQuantity());
    }
}
