package com.taqueria.backend.controller;

import com.taqueria.backend.model.Extra;
import com.taqueria.backend.model.Order;
import com.taqueria.backend.model.Product;
import com.taqueria.backend.service.TaqueriaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class TaqueriaController {

    @Autowired
    private TaqueriaService taqueriaService;

    @Autowired
    private com.taqueria.backend.repository.UserRepository userRepository;

    @GetMapping("/products")
    public List<Product> getAllProducts() {
        return taqueriaService.getAllProducts();
    }

    @PostMapping("/orders")
    public Order createOrder(@RequestBody Order order, java.security.Principal principal) {
        if (principal != null) {
            com.taqueria.backend.model.User user = userRepository.findByUsername(principal.getName()).orElse(null);
            order.setUser(user);
        }
        return taqueriaService.createOrder(order);
    }

    @GetMapping("/orders")
    public List<Order> getAllOrders() {
        return taqueriaService.getAllOrders();
    }

    @PutMapping("/orders/{id}")
    public Order updateOrder(@PathVariable Long id, @RequestBody Order order) {
        return taqueriaService.updateOrder(id, order);
    }

    @GetMapping("/orders/table/{tableNumber}")
    public List<Order> getOrdersByTable(@PathVariable Integer tableNumber) {
        return taqueriaService.getOrdersByTable(tableNumber);
    }

    @PostMapping("/products")
    public Product createProduct(@RequestBody Product product) {
        return taqueriaService.saveProduct(product);
    }

    @PutMapping("/products/{id}")
    public Product updateProduct(@PathVariable Long id, @RequestBody Product product) {
        product.setId(id);
        return taqueriaService.saveProduct(product);
    }

    @DeleteMapping("/products/{id}")
    public void deleteProduct(@PathVariable Long id) {
        taqueriaService.deleteProduct(id);
    }

    @GetMapping("/extras")
    public List<Extra> getAllExtras() {
        return taqueriaService.getAllExtras();
    }

    @PostMapping("/extras")
    public Extra createExtra(@RequestBody Extra extra) {
        return taqueriaService.saveExtra(extra);
    }

    @PutMapping("/extras/{id}")
    public Extra updateExtra(@PathVariable Long id, @RequestBody Extra extra) {
        extra.setId(id);
        return taqueriaService.saveExtra(extra);
    }

    @DeleteMapping("/extras/{id}")
    public void deleteExtra(@PathVariable Long id) {
        taqueriaService.deleteExtra(id);
    }

    @GetMapping("/kitchen/orders")
    public List<Order> getKitchenOrders() {
        return taqueriaService.getKitchenOrders();
    }

    @PatchMapping("/orders/{id}/status")
    public Order updateOrderStatus(@PathVariable Long id, @RequestBody java.util.Map<String, String> statusMap) {
        String statusStr = statusMap.get("status");
        com.taqueria.backend.model.OrderStatus status = com.taqueria.backend.model.OrderStatus.valueOf(statusStr);
        return taqueriaService.updateOrderStatus(id, status);
    }
}
