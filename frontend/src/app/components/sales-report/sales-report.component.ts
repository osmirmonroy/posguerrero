import { Component, OnInit } from '@angular/core';
import { TaqueriaService } from '../../services/taqueria.service';
import { SalesReportDTO, Product, TopProduct, PaymentMethodStats } from '../../models/taqueria.models';

@Component({
    selector: 'app-sales-report',
    templateUrl: './sales-report.component.html',
    styleUrls: ['./sales-report.component.css']
})
export class SalesReportComponent implements OnInit {
    reportData: SalesReportDTO[] = [];
    topProducts: TopProduct[] = [];
    paymentStats: PaymentMethodStats[] = [];

    startDate: Date | undefined;
    endDate: Date | undefined;
    selectedCategories: string[] = [];
    selectedProducts: string[] = [];

    chartData: any;
    topProductsChart: any;
    paymentChart: any;
    chartOptions: any;

    categories: any[] = [
        { label: 'Tacos', value: 'Tacos' },
        { label: 'Tortas', value: 'Tortas' },
        { label: 'Bebidas', value: 'Bebidas' },
        { label: 'Extras', value: 'Extras' },
        { label: 'Postres', value: 'Postres' }
    ];

    products: any[] = [];

    constructor(private taqueriaService: TaqueriaService) { }

    ngOnInit(): void {
        this.loadProducts();
        this.generateReport();
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

    loadProducts() {
        this.taqueriaService.getProducts().subscribe(data => {
            this.products = data.map(p => ({ label: p.name, value: p.name }));
        });
    }

    generateReport() {
        const start = this.startDate ? this.startDate.toISOString().split('T')[0] : undefined;
        const end = this.endDate ? this.endDate.toISOString().split('T')[0] : undefined;

        // General Sales
        this.taqueriaService.getSalesReport(start, end, this.selectedCategories, this.selectedProducts)
            .subscribe(data => {
                this.reportData = data;
                this.updateSalesChart();
            });

        // Top Products
        this.taqueriaService.getTopProducts(start, end).subscribe(data => {
            this.topProducts = data;
            this.updateTopProductsChart();
        });

        // Payment Stats
        this.taqueriaService.getPaymentStats(start, end).subscribe(data => {
            this.paymentStats = data;
            this.updatePaymentChart();
        });
    }

    updateSalesChart() {
        const salesByDate: { [key: string]: number } = {};
        this.reportData.forEach(item => {
            salesByDate[item.date] = (salesByDate[item.date] || 0) + item.totalSales;
        });
        const dates = Object.keys(salesByDate).sort();
        const sales = dates.map(date => salesByDate[date]);
        this.chartData = {
            labels: dates,
            datasets: [{
                label: 'Total Sales by Day',
                data: sales,
                backgroundColor: '#FFA726',
                borderColor: '#FB8C00',
                borderWidth: 1
            }]
        };
    }

    updateTopProductsChart() {
        this.topProductsChart = {
            labels: this.topProducts.slice(0, 5).map(p => p.productName),
            datasets: [{
                label: 'Top 5 Products (Quantity)',
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

    clearFilters() {
        this.startDate = undefined;
        this.endDate = undefined;
        this.selectedCategories = [];
        this.selectedProducts = [];
        this.generateReport();
    }

    exportPdf() {
        const start = this.startDate ? this.startDate.toISOString().split('T')[0] : undefined;
        const end = this.endDate ? this.endDate.toISOString().split('T')[0] : undefined;
        this.taqueriaService.exportPdf(start, end).subscribe(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'sales_report.pdf';
            a.click();
        });
    }

    exportExcel() {
        const start = this.startDate ? this.startDate.toISOString().split('T')[0] : undefined;
        const end = this.endDate ? this.endDate.toISOString().split('T')[0] : undefined;
        this.taqueriaService.exportExcel(start, end).subscribe(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'sales_report.xlsx';
            a.click();
        });
    }
}
