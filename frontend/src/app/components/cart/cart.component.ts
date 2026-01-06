import { Component, OnInit } from '@angular/core';
import { CartService } from '../../services/cart.service';
import { TaqueriaService } from '../../services/taqueria.service';
import { Order, OrderItem } from '../../models/taqueria.models';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
  items: OrderItem[] = [];
  customerName: string = '';

  constructor(
    private cartService: CartService,
    private taqueriaService: TaqueriaService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.cartService.items$.subscribe(items => {
      this.items = items;
    });
  }

  getTotal() {
    return this.cartService.getTotal();
  }

  checkout() {
    if (!this.customerName) {
      alert('Por favor ingrese el nombre del cliente');
      return;
    }
    const order: Order = {
      customerName: this.customerName,
      items: this.items
    };

    this.taqueriaService.createOrder(order).subscribe(() => {
      this.cartService.clearCart();
      this.router.navigate(['/orders']);
    });
  }

  removeFromCart(item: any) {
    this.cartService.removeFromCart(item.product);
  }
}
