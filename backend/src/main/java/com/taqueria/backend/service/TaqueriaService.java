package com.taqueria.backend.service;

import com.taqueria.backend.model.Order;
import com.taqueria.backend.model.OrderStatus;
import com.taqueria.backend.model.Product;
import com.taqueria.backend.model.Extra;
import com.taqueria.backend.model.Branch;
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
            Order savedOrder = orderRepository.save(order);
            messagingTemplate.convertAndSend("/topic/orders", savedOrder);
            return savedOrder;
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

    public List<Order> getAllOrders(Long branchId) {
        if (branchId != null) {
            return orderRepository.findByBranchId(branchId);
        }
        return orderRepository.findAll();
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
                .findByStatusIn(Arrays.asList(OrderStatus.OPEN, OrderStatus.PREPARING, OrderStatus.READY));
    }

    public List<Order> getKitchenOrders(Long branchId) {
        List<OrderStatus> statuses = Arrays.asList(OrderStatus.OPEN, OrderStatus.PREPARING, OrderStatus.READY);
        if (branchId != null) {
            return orderRepository.findByStatusInAndBranchId(statuses, branchId);
        }
        return orderRepository.findByStatusIn(statuses);
    }

    public Order updateOrderStatus(Long id, OrderStatus status) {
        Order order = orderRepository.findById(id).orElse(null);
        if (order != null) {
            order.setStatus(status);
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

    public OrderItem updateOrderItemStatus(Long itemId, OrderStatus status) {
        OrderItem item = orderItemRepository.findById(itemId).orElseThrow(() -> new RuntimeException("Item not found"));
        item.setStatus(status);
        OrderItem savedItem = orderItemRepository.save(item);

        // Notify via WebSocket about the order update (we send the whole order for
        // simplicity)
        Order order = savedItem.getOrder();
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
