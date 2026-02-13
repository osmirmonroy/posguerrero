package com.taqueria.backend.controller;

import java.util.List;
import java.util.Map;
import com.taqueria.backend.model.Extra;
import com.taqueria.backend.model.Order;
import com.taqueria.backend.model.Product;
import com.taqueria.backend.model.Category;
import com.taqueria.backend.model.OrderItem;
import com.taqueria.backend.service.TaqueriaService;
import com.taqueria.backend.dto.ProductDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class TaqueriaController {

    @Autowired
    private TaqueriaService taqueriaService;

    @Autowired
    private com.taqueria.backend.repository.UserRepository userRepository;

    @GetMapping("/products")
    public List<Product> getAllProducts(
            @RequestParam(required = false) Long branchId,
            java.security.Principal principal) {
        if (principal != null) {
            com.taqueria.backend.model.User user = userRepository.findByUsername(principal.getName()).orElse(null);
            if (user != null) {
                if (user.getRole() == com.taqueria.backend.model.Role.ADMIN) {
                    // Admins can see products for any branch if provided, or global if not
                    return taqueriaService.getAllProducts(branchId);
                } else if (user.getBranch() != null) {
                    // Non-admins only see products for their branch
                    return taqueriaService.getAllProducts(user.getBranch().getId());
                }
            }
        }
        return taqueriaService.getAllProducts(branchId);
    }

    @PostMapping("/orders")
    public Order createOrder(@RequestBody Order order, java.security.Principal principal) {
        com.taqueria.backend.model.User user = null;
        if (principal != null) {
            user = userRepository.findByUsername(principal.getName()).orElse(null);
            order.setUser(user);
            if (user != null) {
                // If user is ADMIN and branch is provided in order, use it.
                // Otherwise use user's assigned branch.
                if (user.getRole() == com.taqueria.backend.model.Role.ADMIN && order.getBranch() != null) {
                    // Keep the branch set by admin
                } else {
                    order.setBranch(user.getBranch());
                }
            }
        }
        return taqueriaService.createOrder(order, user);
    }

    @GetMapping("/orders")
    public List<Order> getAllOrders(@RequestParam(required = false) Long branchId) {
        return taqueriaService.getAllOrders(branchId);
    }

    @GetMapping("/orders/{id}")
    public Order getOrder(@PathVariable Long id) {
        return taqueriaService.getOrder(id);
    }

    @PutMapping("/orders/{id}")
    public Order updateOrder(@PathVariable Long id, @RequestBody Order order, java.security.Principal principal) {
        com.taqueria.backend.model.User user = null;
        if (principal != null) {
            user = userRepository.findByUsername(principal.getName()).orElse(null);
        }
        return taqueriaService.updateOrder(id, order, user);
    }

    @DeleteMapping("/orders/{id}")
    public void deleteOrder(@PathVariable Long id, @RequestParam String reason, java.security.Principal principal) {
        com.taqueria.backend.model.User user = null;
        if (principal != null) {
            user = userRepository.findByUsername(principal.getName()).orElse(null);
        }
        taqueriaService.deleteOrder(id, reason, user);
    }

    @PutMapping("/orders/items/{itemId}/status")
    public OrderItem updateOrderItemStatus(@PathVariable Long itemId, @RequestBody Map<String, String> payload,
            java.security.Principal principal) {
        com.taqueria.backend.model.User user = null;
        if (principal != null) {
            user = userRepository.findByUsername(principal.getName()).orElse(null);
        }
        return taqueriaService.updateOrderItemStatus(itemId,
                com.taqueria.backend.model.OrderStatus.valueOf(payload.get("status")), user);
    }

    @GetMapping("/orders/table/{tableNumber}")
    public List<Order> getOrdersByTable(@PathVariable Integer tableNumber) {
        return taqueriaService.getOrdersByTable(tableNumber);
    }

    @PostMapping("/products")
    public Product createProduct(@RequestBody ProductDto productDto) {
        return taqueriaService.saveProductWithPrices(productDto);
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

    @PostMapping("/products/{id}/prices")
    public com.taqueria.backend.model.BranchProduct setBranchPrice(@PathVariable Long id,
            @RequestBody java.util.Map<String, Object> payload) {
        Long branchId = Long.valueOf(payload.get("branchId").toString());
        Double price = Double.valueOf(payload.get("price").toString());
        return taqueriaService.setBranchPrice(branchId, id, price);
    }

    @GetMapping("/products/{id}/prices")
    public java.util.Map<Long, Double> getProductBranchPrices(@PathVariable Long id) {
        return taqueriaService.getProductBranchPrices(id);
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
    public List<Order> getKitchenOrders(@RequestParam(required = false) Long branchId) {
        return taqueriaService.getKitchenOrders(branchId);
    }

    @PatchMapping("/orders/{id}/status")
    public Order updateOrderStatus(@PathVariable Long id, @RequestBody java.util.Map<String, String> statusMap,
            java.security.Principal principal) {
        String statusStr = statusMap.get("status");
        com.taqueria.backend.model.OrderStatus status = com.taqueria.backend.model.OrderStatus.valueOf(statusStr);
        com.taqueria.backend.model.User user = null;
        if (principal != null) {
            user = userRepository.findByUsername(principal.getName()).orElse(null);
        }
        return taqueriaService.updateOrderStatus(id, status, user);
    }

    // Category Endpoints
    @GetMapping("/categories")
    public List<Category> getAllCategories() {
        return taqueriaService.getAllCategories();
    }

    @PostMapping("/categories")
    public Category createCategory(@RequestBody Category category) {
        return taqueriaService.saveCategory(category);
    }

    @PutMapping("/categories/{id}")
    public Category updateCategory(@PathVariable Long id, @RequestBody Category category) {
        category.setId(id);
        return taqueriaService.saveCategory(category);
    }

    @DeleteMapping("/categories/{id}")
    public void deleteCategory(@PathVariable Long id) {
        taqueriaService.deleteCategory(id);
    }
}
