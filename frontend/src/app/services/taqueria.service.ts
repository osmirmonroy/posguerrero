import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product, Order, Extra, SalesReportDTO } from '../models/taqueria.models';
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

    deleteExtra(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/extras/${id}`);
    }

    getSalesReport(startDate?: string, endDate?: string, categories?: string[], products?: string[]): Observable<SalesReportDTO[]> {
        let params: any = {};
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;
        if (categories) params.categories = categories.join(',');
        if (products) params.products = products.join(',');
        return this.http.get<SalesReportDTO[]>(`${this.apiUrl}/reports/sales`, { params });
    }
}
