import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product, Order, Extra, SalesReportDTO, Shift, Supplier, Supply, InventoryTransaction, TopProduct, PaymentMethodStats, DashboardSummary } from '../models/taqueria.models';
import { environment } from '../../environments/environment';


export interface User {
    id?: number;
    username: string;
    password?: string;
    role: string;
}


@Injectable({
    providedIn: 'root'
})
export class TaqueriaService {
    private apiUrl = environment.apiUrl;

    constructor(private http: HttpClient) { }

    getProducts(): Observable<Product[]> {
        return this.http.get<Product[]>(`${this.apiUrl}/products`);
    }

    // User Methods
    getUsers(): Observable<User[]> {
        return this.http.get<User[]>(`${this.apiUrl}/users`);
    }

    getUser(id: number): Observable<User> {
        return this.http.get<User>(`${this.apiUrl}/users/${id}`);
    }

    saveUser(user: User): Observable<User> {
        if (user.id) {
            return this.http.put<User>(`${this.apiUrl}/users/${user.id}`, user);
        } else {
            return this.http.post<User>(`${this.apiUrl}/users`, user);
        }
    }

    deleteUser(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/users/${id}`);
    }


    createOrder(order: Order): Observable<Order> {
        return this.http.post<Order>(`${this.apiUrl}/orders`, order);
    }

    getOrders(): Observable<Order[]> {
        return this.http.get<Order[]>(`${this.apiUrl}/orders`);
    }

    updateOrder(id: number, order: Order): Observable<Order> {
        return this.http.put<Order>(`${this.apiUrl}/orders/${id}`, order);
    }

    getOrdersByTable(tableNumber: number): Observable<Order[]> {
        return this.http.get<Order[]>(`${this.apiUrl}/orders/table/${tableNumber}`);
    }

    saveProduct(product: Product): Observable<Product> {
        if (product.id) {
            return this.http.put<Product>(`${this.apiUrl}/products/${product.id}`, product);
        } else {
            return this.http.post<Product>(`${this.apiUrl}/products`, product);
        }
    }

    deleteProduct(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/products/${id}`);
    }

    getExtras(): Observable<Extra[]> {
        return this.http.get<Extra[]>(`${this.apiUrl}/extras`);
    }

    saveExtra(extra: Extra): Observable<Extra> {
        if (extra.id) {
            return this.http.put<Extra>(`${this.apiUrl}/extras/${extra.id}`, extra);
        } else {
            return this.http.post<Extra>(`${this.apiUrl}/extras`, extra);
        }
    }

    getKitchenOrders(): Observable<Order[]> {
        return this.http.get<Order[]>(`${this.apiUrl}/kitchen/orders`);
    }

    updateOrderStatus(id: number, status: string): Observable<Order> {
        return this.http.patch<Order>(`${this.apiUrl}/orders/${id}/status`, { status });
    }

    deleteExtra(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/extras/${id}`);
    }

    // Shift Methods
    openShift(initialCash: number): Observable<Shift> {
        return this.http.post<Shift>(`${this.apiUrl}/shifts/open`, { initialCash });
    }

    closeShift(finalCashDeclared: number, comments: string): Observable<Shift> {
        return this.http.post<Shift>(`${this.apiUrl}/shifts/close`, { finalCashDeclared, comments });
    }

    getCurrentShift(): Observable<Shift> {
        return this.http.get<Shift>(`${this.apiUrl}/shifts/current`);
    }

    performCashCut(shiftId: number, declaredAmount: number, notes: string): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/shifts/${shiftId}/cut`, { declaredAmount, notes });
    }

    // Inventory Methods
    // Suppliers
    getSuppliers(): Observable<Supplier[]> {
        return this.http.get<Supplier[]>(`${this.apiUrl}/inventory/suppliers`);
    }

    saveSupplier(supplier: Supplier): Observable<Supplier> {
        if (supplier.id) {
            return this.http.put<Supplier>(`${this.apiUrl}/inventory/suppliers/${supplier.id}`, supplier);
        } else {
            return this.http.post<Supplier>(`${this.apiUrl}/inventory/suppliers`, supplier);
        }
    }

    deleteSupplier(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/inventory/suppliers/${id}`);
    }

    // Supplies
    getSupplies(): Observable<Supply[]> {
        return this.http.get<Supply[]>(`${this.apiUrl}/inventory/supplies`);
    }

    saveSupply(supply: Supply): Observable<Supply> {
        if (supply.id) {
            return this.http.put<Supply>(`${this.apiUrl}/inventory/supplies/${supply.id}`, supply);
        } else {
            return this.http.post<Supply>(`${this.apiUrl}/inventory/supplies`, supply);
        }
    }

    deleteSupply(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/inventory/supplies/${id}`);
    }

    // Transactions
    addInventoryTransaction(transaction: any): Observable<InventoryTransaction> {
        return this.http.post<InventoryTransaction>(`${this.apiUrl}/inventory/transactions`, transaction);
    }

    getInventoryTransactions(supplyId: number): Observable<InventoryTransaction[]> {
        return this.http.get<InventoryTransaction[]>(`${this.apiUrl}/inventory/transactions/supply/${supplyId}`);
    }

    getLowStockAlerts(): Observable<Supply[]> {
        return this.http.get<Supply[]>(`${this.apiUrl}/inventory/alerts`);
    }

    getSalesReport(startDate?: string, endDate?: string, categories?: string[], products?: string[]): Observable<SalesReportDTO[]> {
        let params: any = {};
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;
        if (categories) params.categories = categories.join(',');
        if (products) params.products = products.join(',');
        return this.http.get<SalesReportDTO[]>(`${this.apiUrl}/reports/sales`, { params });
    }

    getTopProducts(startDate?: string, endDate?: string): Observable<TopProduct[]> {
        let params: any = {};
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;
        return this.http.get<TopProduct[]>(`${this.apiUrl}/reports/top-products`, { params });
    }

    getPaymentStats(startDate?: string, endDate?: string): Observable<PaymentMethodStats[]> {
        let params: any = {};
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;
        return this.http.get<PaymentMethodStats[]>(`${this.apiUrl}/reports/payment-stats`, { params });
    }

    exportPdf(startDate?: string, endDate?: string): Observable<Blob> {
        let params: any = {};
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;
        return this.http.get(`${this.apiUrl}/reports/sales/export/pdf`, { params, responseType: 'blob' });
    }

    exportExcel(startDate?: string, endDate?: string): Observable<Blob> {
        let params: any = {};
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;
        return this.http.get(`${this.apiUrl}/reports/sales/export/excel`, { params, responseType: 'blob' });
    }

    getDashboardSummary(): Observable<DashboardSummary> {
        return this.http.get<DashboardSummary>(`${this.apiUrl}/dashboard/summary`);
    }
}
