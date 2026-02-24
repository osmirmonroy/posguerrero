import { Component, OnInit } from '@angular/core';
import { TaqueriaService } from '../../services/taqueria.service';
import { BranchService } from '../../services/branch.service';
import { Order } from '../../models/taqueria.models';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { BluetoothPrintService } from '../../services/bluetooth-print.service';
import { EscPosEncoder } from '../../utils/esc-pos-encoder';
import { OrderItem } from '../../models/taqueria.models';

@Component({
  selector: 'app-order-list',
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.css'],
  providers: [MessageService]
})
export class OrderListComponent implements OnInit {
  orders: Order[] = [];
  selectedOrder: Order | null = null;
  dialogVisible: boolean = false;
  deleteDialogVisible: boolean = false;
  deletionReason: string = '';
  orderToDelete: Order | null = null;

  constructor(
    private taqueriaService: TaqueriaService,
    private branchService: BranchService,
    private router: Router,
    private messageService: MessageService,
    private printService: BluetoothPrintService
  ) { }

  ngOnInit(): void {
    this.branchService.selectedBranch$.subscribe(branchId => {
      this.loadOrders(branchId || undefined);
    });
  }

  loadOrders(branchId?: number) {
    this.taqueriaService.getOrders(branchId).subscribe(data => {
      this.orders = data;
    });
  }

  showDetails(order: Order) {
    this.selectedOrder = order;
    this.dialogVisible = true;
  }

  editOrder(order: Order) {
    this.dialogVisible = false;
    // Use the router to navigate to /menu with orderId as query param
    this.router.navigate(['/menu'], { queryParams: { orderId: order.id } });
  }

  confirmDelete(order: Order) {
    this.orderToDelete = order;
    this.deletionReason = '';
    this.deleteDialogVisible = true;
  }

  executeDelete() {
    if (!this.deletionReason || this.deletionReason.trim().length < 5) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Debe ingresar un motivo de al menos 5 caracteres.' });
      return;
    }

    if (this.orderToDelete && this.orderToDelete.id) {
      this.taqueriaService.deleteOrder(this.orderToDelete.id, this.deletionReason).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Borrado', detail: 'El pedido ha sido borrado lógicamente.' });
          this.deleteDialogVisible = false;
          this.dialogVisible = false;
          this.loadOrders(this.branchService.getSelectedBranch() || undefined);
        },
        error: () => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo borrar el pedido.' });
        }
      });
    }
  }

  getItemTotal(item: OrderItem): number {
    let price = item.product.price;
    if (item.extras) {
      price += item.extras.reduce((sum, e) => sum + e.price, 0);
    }
    return price * item.quantity;
  }

  async printTicket(order: Order) {
    const encoder = new EscPosEncoder();

    encoder
      .align('center')
      .size(true, true)
      .line('Tacos el Guerrero')
      .size(false, false)
      .line('Ricos Tacos Estilo Mexico')
      .line('--------------------------------')
      .align('left')
      .line(`Ticket #: ${order.id || 'N/A'}`)
      .line(`Fecha: ${new Date(order.date || Date.now()).toLocaleString()}`)
      .line(`Cliente: ${order.customerName || 'General'}`)
      .line('--------------------------------')
      .bold(true)
      .line('Item              Cant.  Total')
      .bold(false);

    order.items.forEach(item => {
      const name = item.product.name.substring(0, 16).padEnd(16);
      const qty = item.quantity.toString().padStart(5);
      const total = this.getItemTotal(item).toFixed(2).padStart(7);
      encoder.line(`${name} ${qty} ${total}`);

      if (item.extras && item.extras.length > 0) {
        item.extras.forEach(extra => {
          encoder.line(` + ${extra.name}`);
        });
      }
    });

    const grandTotal = order.items.reduce((sum, item) => sum + this.getItemTotal(item), 0);

    encoder
      .line('--------------------------------')
      .align('right')
      .bold(true)
      .size(false, true)
      .line(`TOTAL: $${grandTotal.toFixed(2)}`)
      .size(false, false)
      .line(' ')
      .align('center')
      .line('¡Gracias por su preferencia!')
      .line(' ')
      .line(' ')
      .cut();

    await this.printService.print(encoder.encode());
  }
}
