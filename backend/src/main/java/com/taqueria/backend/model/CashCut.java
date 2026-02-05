package com.taqueria.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "cash_cuts")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CashCut {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shift_id", nullable = false)
    private Shift shift;

    @Column(nullable = false)
    private LocalDateTime cutTime;

    @Column(nullable = false)
    private Double declaredAmount;

    @Column(nullable = false)
    private Double systemAmount;

    private Double difference;

    private String notes;
}
