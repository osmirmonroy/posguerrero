package com.taqueria.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

@Entity
@Table(name = "branch_supplies", uniqueConstraints = {
        @UniqueConstraint(columnNames = { "branch_id", "supply_id" })
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BranchSupply {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "branch_id", nullable = false)
    private Branch branch;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supply_id", nullable = false)
    private Supply supply;

    @Column(nullable = false)
    private Double stock;

    @Column(name = "min_stock")
    private Double minStock;
}
