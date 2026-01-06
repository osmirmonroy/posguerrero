import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { OrderItem, Product } from '../models/taqueria.models';

@Injectable({
    providedIn: 'root'
})
export class CartService {
    private itemsSubject = new BehaviorSubject<OrderItem[]>([]);
    items$ = this.itemsSubject.asObservable();

    addToCart(product: Product) {
        const currentItems = this.itemsSubject.value;
        const existingItem = currentItems.find(item => item.product.id === product.id);

        if (existingItem) {
            existingItem.quantity++;
        } else {
            currentItems.push({ product, quantity: 1 });
        }
        this.itemsSubject.next([...currentItems]);
    }

    removeFromCart(product: Product) {
        const currentItems = this.itemsSubject.value;
        const updatedItems = currentItems.filter(item => item.product.id !== product.id);
        this.itemsSubject.next(updatedItems);
    }

    clearCart() {
        this.itemsSubject.next([]);
    }

    getItems() {
        return this.itemsSubject.value;
    }

    getTotal() {
        return this.itemsSubject.value.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
    }
}
