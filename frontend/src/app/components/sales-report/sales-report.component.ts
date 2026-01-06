import { Component, OnInit } from '@angular/core';
import { TaqueriaService } from '../../services/taqueria.service';
import { SalesReportDTO, Product } from '../../models/taqueria.models';

@Component({
    selector: 'app-sales-report',
    templateUrl: './sales-report.component.html',
    styleUrls: ['./sales-report.component.css']
})
export class SalesReportComponent implements OnInit {
    reportData: SalesReportDTO[] = [];
    startDate: Date | undefined;
    endDate: Date | undefined;
    selectedCategories: string[] = [];
    selectedProducts: string[] = [];
    chartData: any;
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
                    labels: {
                        color: '#495057'
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: '#495057'
                    },
                    grid: {
                        color: '#ebedef'
                    }
                },
                y: {
                    ticks: {
                        color: '#495057'
                    },
                    grid: {
                        color: '#ebedef'
                    }
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

        this.taqueriaService.getSalesReport(start, end, this.selectedCategories, this.selectedProducts)
            .subscribe(data => {
                this.reportData = data;
                this.updateChart();
            });
    }

    updateChart() {
        const salesByDate: { [key: string]: number } = {};

        this.reportData.forEach(item => {
            if (salesByDate[item.date]) {
                salesByDate[item.date] += item.totalSales;
            } else {
                salesByDate[item.date] = item.totalSales;
            }
        });

        const dates = Object.keys(salesByDate).sort();
        const sales = dates.map(date => salesByDate[date]);

        this.chartData = {
            labels: dates,
            datasets: [
                {
                    label: 'Ventas Totales por Día',
                    data: sales,
                    backgroundColor: '#FFA726',
                    borderColor: '#FB8C00',
                    borderWidth: 1
                }
            ]
        };
    }

    clearFilters() {
        this.startDate = undefined;
        this.endDate = undefined;
        this.selectedCategories = [];
        this.selectedProducts = [];
        this.generateReport();
    }
}
