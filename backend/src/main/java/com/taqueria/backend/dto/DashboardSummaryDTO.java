package com.taqueria.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DashboardSummaryDTO {
    private Double dailySalesTotal;
    private Long activeOrdersCount;
    private Long lowStockItemsCount;
}
