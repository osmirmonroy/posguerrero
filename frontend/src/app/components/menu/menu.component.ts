import { Component, OnInit } from '@angular/core';
import { Product, Order, OrderItem, OrderStatus, Extra } from '../../models/taqueria.models';
import { TaqueriaService } from '../../services/taqueria.service';
import { BranchService } from '../../services/branch.service';
import { MessageService } from 'primeng/api';
import { ActivatedRoute } from '@angular/router';
import { ThermalPrinterService } from '../../services/thermal-printer.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css'],
  providers: [MessageService]
})
export class MenuComponent implements OnInit {
  products: Product[] = [];
  allProducts: Product[] = [];
  groupedProducts: { name: string, products: Product[] }[] = [];
  layout: 'list' | 'grid' = 'grid';
  currentOrder: Order | null = null;
  customerName: string = '';
  orderItems: OrderItem[] = [];
  extras: Extra[] = [];
  selectedExtras: Extra[] = [];
  selectedProduct: Product | null = null;
  extrasDialog: boolean = false;
  selectedCategory: string = 'Todos';
  categories: string[] = [];

  constructor(
    private taqueriaService: TaqueriaService,
    private branchService: BranchService,
    public messageService: MessageService,
    private route: ActivatedRoute,
    private printService: ThermalPrinterService
  ) { }

  ngOnInit(): void {
    this.branchService.selectedBranch$.subscribe(branchId => {
      this.loadProducts(branchId || undefined);
    });

    this.taqueriaService.getExtras().subscribe(data => {
      this.extras = data;
    });

    // Handle order editing
    this.route.queryParams.subscribe(params => {
      const orderId = params['orderId'];
      if (orderId) {
        this.loadOrderForEditing(Number(orderId));
      }
    });
  }

  loadOrderForEditing(id: number) {
    this.taqueriaService.getOrder(id).subscribe({
      next: (order) => {
        this.currentOrder = order;
        this.orderItems = [...order.items];
        this.customerName = order.customerName || '';
        this.messageService.add({ severity: 'info', summary: 'Pedido Cargado', detail: `Editando pedido #${id}` });
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar el pedido para editar' });
      }
    });
  }

  loadProducts(branchId?: number) {
    this.taqueriaService.getProducts(branchId).subscribe({
      next: (data) => {
        this.allProducts = data;
        this.products = [...this.allProducts];
        this.groupProducts();
        this.loadCategories();
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los productos' });
      }
    });
  }

  loadCategories() {
    const categorySet = new Set<string>();
    this.allProducts.forEach(p => {
      if (p.category) categorySet.add(p.category);
    });
    this.categories = ['Todos', ...Array.from(categorySet)];
  }

  groupProducts() {
    const groups: { [key: string]: Product[] } = {};
    this.products.forEach(product => {
      const category = product.category || 'General';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(product);
    });

    this.groupedProducts = Object.keys(groups).map(name => ({
      name,
      products: groups[name]
    }));
  }

  filterProducts(query: string) {
    if (!query) {
      this.products = [...this.allProducts];
    } else {
      this.products = this.allProducts.filter(p => p.name.toLowerCase().includes(query.toLowerCase()));
    }
    this.groupProducts();
  }

  startNewOrder() {
    this.currentOrder = null;
    this.orderItems = [];
    this.customerName = '';
    this.messageService.add({ severity: 'info', summary: 'Nuevo Pedido', detail: 'Iniciando un nuevo pedido.' });
  }

  openExtrasDialog(product: Product) {
    if (!this.currentOrder && this.orderItems.length === 0) {
      this.startNewOrder();
    }
    this.selectedProduct = product;
    this.selectedExtras = [];
    this.extrasDialog = true;
  }

  confirmExtras() {
    if (this.selectedProduct) {
      // Auto-start order if needed
      if (!this.currentOrder && this.orderItems.length === 0) {
        this.currentOrder = { items: [], status: OrderStatus.OPEN };
      }

      const productName = this.selectedProduct.name; // Capture name before clearing

      this.orderItems.push({
        product: this.selectedProduct,
        quantity: 1,
        extras: this.selectedExtras
      });

      this.messageService.add({ severity: 'success', summary: 'Item Agregado', detail: `${productName} agregado al pedido`, life: 2000 });

      this.extrasDialog = false;
      this.selectedProduct = null;
      this.selectedExtras = [];
    }
  }

  sendOrder() {
    const selectedBranchId = this.branchService.getSelectedBranch();

    const order: Order = {
      id: this.currentOrder?.id,
      items: this.orderItems,
      status: this.currentOrder ? this.currentOrder.status : OrderStatus.OPEN,
      customerName: this.customerName,
      branch: selectedBranchId ? { id: selectedBranchId } : undefined
    };

    if (this.currentOrder && this.currentOrder.id) {
      this.taqueriaService.updateOrder(this.currentOrder.id, order).subscribe({
        next: (updatedOrder) => {
          this.currentOrder = updatedOrder;
          this.orderItems = updatedOrder.items;
          this.customerName = updatedOrder.customerName || '';
          this.messageService.add({ severity: 'success', summary: 'Pedido Actualizado', detail: 'Pedido enviado a cocina' });
        },
        error: () => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo actualizar el pedido' });
        }
      });
    } else {
      this.taqueriaService.createOrder(order).subscribe({
        next: (newOrder) => {
          this.currentOrder = newOrder;
          this.orderItems = newOrder.items;
          this.customerName = newOrder.customerName || '';
          this.messageService.add({
            severity: 'success',
            summary: 'Pedido Creado',
            detail: 'Pedido creado exitosamente. ¿Desea imprimir el ticket?',
            sticky: true,
            id: 'print-toast',
            data: newOrder
          });
        },
        error: () => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo crear el pedido' });
        }
      });
    }
  }

  updateStatus(status: OrderStatus) {
    if (this.currentOrder && this.currentOrder.id) {
      const updatedOrder = { ...this.currentOrder, status: status };
      this.taqueriaService.updateOrder(this.currentOrder.id, updatedOrder).subscribe({
        next: (order) => {
          this.currentOrder = order;
          this.messageService.add({ severity: 'success', summary: 'Estado Actualizado', detail: `Estado del pedido cambiado a ${status}` });
          if (status === OrderStatus.PAID) {
            this.currentOrder = null;
            this.orderItems = [];
          }
        },
        error: () => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo actualizar el estado' });
        }
      });
    }
  }

  get OrderStatus() {
    return OrderStatus;
  }

  getItemTotal(item: OrderItem): number {
    let price = item.product.price;
    if (item.extras) {
      price += item.extras.reduce((sum, e) => sum + e.price, 0);
    }
    return price * item.quantity;
  }

  updateQuantity(item: OrderItem, delta: number) {
    item.quantity += delta;
    if (item.quantity <= 0) {
      this.removeItem(item);
    }
  }

  removeItem(item: OrderItem) {
    const index = this.orderItems.indexOf(item);
    if (index > -1) {
      this.orderItems.splice(index, 1);
      this.messageService.add({ severity: 'info', summary: 'Item Eliminado', detail: 'Item removido del pedido', life: 2000 });
    }
  }

  getOrderTotal(): number {
    return this.orderItems.reduce((sum, item) => sum + this.getItemTotal(item), 0);
  }

  filterByCategory(category: string) {
    this.selectedCategory = category;
    if (category === 'Todos') {
      this.products = [...this.allProducts];
    } else {
      this.products = this.allProducts.filter(p => p.category === category);
    }
    this.groupProducts();
  }

  canSendOrder(): boolean {
    return this.orderItems.length > 0;
  }

  async printTicket(order: Order) {
    // Legacy fallback handled by connectAndPrint below or inside the service if already connected.
    await this.printService.printTicket(order);
  }

  async connectAndPrint(order: Order, connectionType: 'bluetooth' | 'usb') {
    if (!this.printService.isConnected()) {
      let connected = false;
      if (connectionType === 'bluetooth') {
        connected = await this.printService.connectBluetooth();
      } else if (connectionType === 'usb') {
        connected = await this.printService.connectUsb();
      }
      if (!connected) return;
    }
    await this.printService.printTicket(order);
  }

  clearOrder() {
    this.currentOrder = null;
    this.orderItems = [];
    this.customerName = '';
    this.messageService.add({ severity: 'info', summary: 'Pedido Cancelado', detail: 'El pedido fue cancelado', life: 2000 });
  }
}
