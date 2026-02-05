package com.taqueria.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TopProductDTO {
    private String productName;
    private Long quantity;
    private Double total;
}
