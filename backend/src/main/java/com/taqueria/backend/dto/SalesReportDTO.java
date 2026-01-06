package com.taqueria.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SalesReportDTO {
    private LocalDate date;
    private String category;
    private Long quantity;
    private Double totalSales;
}
