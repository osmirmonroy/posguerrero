import { Component, OnInit } from '@angular/core';
import { TaqueriaService } from '../../services/taqueria.service';
import { Order } from '../../models/taqueria.models';

@Component({
  selector: 'app-order-list',
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.css']
})
export class OrderListComponent implements OnInit {
  orders: Order[] = [];
  selectedOrder: Order | null = null;
  dialogVisible: boolean = false;

  constructor(private taqueriaService: TaqueriaService) { }

  ngOnInit(): void {
    this.taqueriaService.getOrders().subscribe(data => {
      this.orders = data;
    });
  }

  showDetails(order: Order) {
    this.selectedOrder = order;
    this.dialogVisible = true;
  }
}
