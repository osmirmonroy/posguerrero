import { Component, OnInit } from '@angular/core';
import { TaqueriaService } from '../../services/taqueria.service';
import { BranchService } from '../../services/branch.service';
import { Order } from '../../models/taqueria.models';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';

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
    private messageService: MessageService
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
}
