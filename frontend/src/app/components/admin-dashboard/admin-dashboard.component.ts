import { Component, OnInit } from '@angular/core';
import { TaqueriaService } from '../../services/taqueria.service';
import { DashboardSummary, TopProduct, PaymentMethodStats } from '../../models/taqueria.models';

@Component({
    selector: 'app-admin-dashboard',
    templateUrl: './admin-dashboard.component.html',
    styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
    summary: DashboardSummary | null = null;
    topProducts: TopProduct[] = [];
    paymentStats: PaymentMethodStats[] = [];

    productsChart: any;
    paymentChart: any;
    chartOptions: any;

    constructor(private taqueriaService: TaqueriaService) { }

    ngOnInit(): void {
        this.loadDashboardData();
        this.initChartOptions();
    }

    initChartOptions() {
        this.chartOptions = {
            plugins: {
                legend: {
                    labels: { color: '#495057' }
                }
            },
            scales: {
                x: {
                    ticks: { color: '#495057' },
                    grid: { color: '#ebedef' }
                },
                y: {
                    ticks: { color: '#495057' },
                    grid: { color: '#ebedef' }
                }
            }
        };
    }

    loadDashboardData() {
        this.taqueriaService.getDashboardSummary().subscribe(data => {
            this.summary = data;
        });

        const today = new Date().toISOString().split('T')[0];
        // Load Top Products for Today
        this.taqueriaService.getTopProducts(today, today).subscribe(data => {
            this.topProducts = data;
            this.updateProductsChart();
        });

        // Load Payment Stats for Today
        this.taqueriaService.getPaymentStats(today, today).subscribe(data => {
            this.paymentStats = data;
            this.updatePaymentChart();
        });
    }

    updateProductsChart() {
        this.productsChart = {
            labels: this.topProducts.slice(0, 5).map(p => p.productName),
            datasets: [{
                label: 'Top 5 Products Today',
                data: this.topProducts.slice(0, 5).map(p => p.quantity),
                backgroundColor: ['#42A5F5', '#66BB6A', '#FFA726', '#26C6DA', '#7E57C2']
            }]
        };
    }

    updatePaymentChart() {
        this.paymentChart = {
            labels: this.paymentStats.map(p => p.paymentMethod),
            datasets: [{
                data: this.paymentStats.map(p => p.total),
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56']
            }]
        };
    }
}
