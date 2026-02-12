package com.taqueria.backend.dto;

import lombok.Data;
import java.util.Map;

@Data
public class ProductDto {
    private String name;
    private Double price;
    private String description;
    private String category;
    private Map<Long, Double> branchPrices;
}
