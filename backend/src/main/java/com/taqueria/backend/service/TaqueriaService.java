package com.taqueria.backend.service;

import com.taqueria.backend.model.Order;
import com.taqueria.backend.model.OrderStatus;
import com.taqueria.backend.model.Product;
import com.taqueria.backend.model.Extra;
import com.taqueria.backend.model.OrderItem;
import com.taqueria.backend.repository.ExtraRepository;
import com.taqueria.backend.repository.OrderRepository;
import com.taqueria.backend.repository.ProductRepository;
import com.taqueria.backend.repository.OrderItemRepository;
import com.taqueria.backend.repository.BranchProductRepository;
import com.taqueria.backend.repository.BranchRepository;
import com.taqueria.backend.model.Category;
import com.taqueria.backend.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.taqueria.backend.dto.ProductDto;

import java.time.LocalDateTime;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import java.util.Arrays;
import java.util.List;

@Service
public class TaqueriaService {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ExtraRepository extraRepository;

    @Autowired
    private BranchProductRepository branchProductRepository;

    @Autowired
    private BranchRepository branchRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public List<Product> getAllProducts(Long branchId) {
        List<Product> products = productRepository.findAll();
        if (branchId != null) {
            java.util.Map<Long, Double> branchPrices = branchProductRepository.findByBranchId(branchId).stream()
                    .collect(java.util.stream.Collectors.toMap(bp -> bp.getProduct().getId(), bp -> bp.getPrice()));

            for (Product p : products) {
                if (branchPrices.containsKey(p.getId())) {
                    p.setPrice(branchPrices.get(p.getId()));
                }
            }
        }
        return products;
    }

    public Order createOrder(Order order, com.taqueria.backend.model.User user) {
        order.setDate(LocalDateTime.now());
        if (order.getStatus() == null) {
            order.setStatus(OrderStatus.OPEN);
        }
        order.setActive(true);
        order.setCreatedBy(user);
        order.setModifiedBy(user);

        // Ensure branch is assigned
        if (order.getBranch() == null && user != null && user.getBranch() != null) {
            order.setBranch(user.getBranch());
        }

        if (order.getBranch() == null) {
            throw new RuntimeException("El pedido debe estar asignado a una sucursal.");
        }

        // Calculate total if not provided or verify it
        double total = 0;
        if (order.getItems() != null) {
            for (var item : order.getItems()) {
                item.setOrder(order);
                // Now fetching branch aware price if branch is set on order
                Product p = productRepository.findById(item.getProduct().getId()).orElse(null);
                if (p != null) {
                    double itemPrice = p.getPrice(); // Default to global

                    // Check for Branch Price override
                    if (order.getBranch() != null) {
                        var branchProduct = branchProductRepository
                                .findByBranchIdAndProductId(order.getBranch().getId(), p.getId());
                        if (branchProduct.isPresent()) {
                            itemPrice = branchProduct.get().getPrice();
                        }
                    }

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

    public Order updateOrder(Long id, Order orderDetails, com.taqueria.backend.model.User user) {
        Order order = orderRepository.findById(id).orElse(null);
        if (order != null) {
            order.setModifiedBy(user);
            if (orderDetails.getStatus() != null) {
                order.setStatus(orderDetails.getStatus());
            }
            if (orderDetails.getItems() != null) {
                // Clear and replace items if new list provided
                order.getItems().clear();
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
                        // Handle branch price if applicable
                        if (order.getBranch() != null) {
                            var bp = branchProductRepository.findByBranchIdAndProductId(order.getBranch().getId(),
                                    p.getId());
                            if (bp.isPresent())
                                itemPrice = bp.get().getPrice();
                        }
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
            Order savedOrder = orderRepository.save(order);
            messagingTemplate.convertAndSend("/topic/orders", savedOrder);
            return savedOrder;
        }
        return null;
    }

    public void deleteOrder(Long id, String reason, com.taqueria.backend.model.User user) {
        Order order = orderRepository.findById(id).orElseThrow(() -> new RuntimeException("Pedido no encontrado"));
        order.setActive(false);
        order.setDeletionReason(reason);
        order.setDeletedBy(user);
        order.setDeletionDate(LocalDateTime.now());
        orderRepository.save(order);
        messagingTemplate.convertAndSend("/topic/orders", order);
    }

    public List<Order> getOrdersByTable(Integer tableNumber) {
        return orderRepository.findByTableNumberAndStatusAndIsActiveTrue(tableNumber, OrderStatus.OPEN);
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAllByIsActiveTrue();
    }

    public Order getOrder(Long id) {
        return orderRepository.findById(id).orElse(null);
    }

    public List<Order> getAllOrders(Long branchId) {
        if (branchId != null) {
            return orderRepository.findByBranchIdAndIsActiveTrue(branchId);
        }
        return orderRepository.findAllByIsActiveTrue();
    }

    public Product saveProduct(Product product) {
        return productRepository.save(product);
    }

    public Product saveProductWithPrices(ProductDto productDto) {
        Product product = new Product();
        product.setName(productDto.getName());
        product.setPrice(productDto.getPrice());
        product.setDescription(productDto.getDescription());
        product.setCategory(productDto.getCategory());

        Product savedProduct = productRepository.save(product);

        if (productDto.getBranchPrices() != null) {
            for (java.util.Map.Entry<Long, Double> entry : productDto.getBranchPrices().entrySet()) {
                setBranchPrice(entry.getKey(), savedProduct.getId(), entry.getValue());
            }
        }
        return savedProduct;
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

    public List<Order> getKitchenOrders() {
        return orderRepository
                .findByStatusInAndIsActiveTrue(
                        Arrays.asList(OrderStatus.OPEN, OrderStatus.PREPARING, OrderStatus.READY));
    }

    public List<Order> getKitchenOrders(Long branchId) {
        List<OrderStatus> statuses = Arrays.asList(OrderStatus.OPEN, OrderStatus.PREPARING, OrderStatus.READY);
        if (branchId != null) {
            return orderRepository.findByStatusInAndBranchIdAndIsActiveTrue(statuses, branchId);
        }
        return orderRepository.findByStatusInAndIsActiveTrue(statuses);
    }

    public Order updateOrderStatus(Long id, OrderStatus status, com.taqueria.backend.model.User user) {
        Order order = orderRepository.findById(id).orElse(null);
        if (order != null) {
            order.setStatus(status);
            order.setModifiedBy(user);
            Order updatedOrder = orderRepository.save(order);
            // Notify kitchen/cashier
            messagingTemplate.convertAndSend("/topic/orders", updatedOrder);
            return updatedOrder;
        }
        return null;
    }

    public com.taqueria.backend.model.BranchProduct setBranchPrice(Long branchId, Long productId, Double price) {
        com.taqueria.backend.model.Branch branch = branchRepository.findById(branchId)
                .orElseThrow(() -> new RuntimeException("Branch not found"));
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        java.util.Optional<com.taqueria.backend.model.BranchProduct> existing = branchProductRepository
                .findByBranchIdAndProductId(branchId, productId);
        com.taqueria.backend.model.BranchProduct branchProduct;
        if (existing.isPresent()) {
            branchProduct = existing.get();
            branchProduct.setPrice(price);
        } else {
            branchProduct = com.taqueria.backend.model.BranchProduct.builder()
                    .branch(branch)
                    .product(product)
                    .price(price)
                    .build();
        }
        return branchProductRepository.save(branchProduct);
    }

    public java.util.Map<Long, Double> getProductBranchPrices(Long productId) {
        return branchProductRepository.findByProductId(productId).stream()
                .collect(java.util.stream.Collectors.toMap(bp -> bp.getBranch().getId(), bp -> bp.getPrice()));
    }

    public OrderItem updateOrderItemStatus(Long itemId, OrderStatus status, com.taqueria.backend.model.User user) {
        OrderItem item = orderItemRepository.findById(itemId).orElseThrow(() -> new RuntimeException("Item not found"));
        item.setStatus(status);

        Order order = item.getOrder();
        if (order != null) {
            order.setModifiedBy(user);
            orderRepository.save(order);
        }

        OrderItem savedItem = orderItemRepository.save(item);

        // Notify via WebSocket about the order update (we send the whole order for
        // simplicity)
        messagingTemplate.convertAndSend("/topic/orders", order);

        return savedItem;
    }

    // Category Methods
    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    public Category saveCategory(Category category) {
        return categoryRepository.save(category);
    }

    public void deleteCategory(Long id) {
        categoryRepository.deleteById(id);
    }
}
