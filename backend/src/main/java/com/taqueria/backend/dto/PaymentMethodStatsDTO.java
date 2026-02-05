package com.taqueria.backend.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class PaymentMethodStatsDTO {
    private String paymentMethod;
    private Long count;
    private Double total;

    public PaymentMethodStatsDTO(String paymentMethod, Long count, Double total) {
        this.paymentMethod = paymentMethod;
        this.count = count;
        this.total = total;
    }
}
