import { Component, OnInit } from '@angular/core';
import { Supply, Supplier } from '../../models/taqueria.models';
import { TaqueriaService } from '../../services/taqueria.service';
import { MessageService, ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-inventory-list',
  templateUrl: './inventory-list.component.html',
  styleUrls: ['./inventory-list.component.css']
})
export class InventoryListComponent implements OnInit {
  supplies: Supply[] = [];
  suppliers: Supplier[] = [];

  supplyDialog: boolean = false;
  supply: Supply = this.getEmptySupply();
  submitted: boolean = false;

  // Transaction Dialog
  transactionDialog: boolean = false;
  transaction: any = { type: 'IN', quantity: 0, reason: '' };
  selectedSupplyForTransaction: Supply | null = null;

  // Kardex Dialog
  kardexDialog: boolean = false;
  selectedSupplyForKardex: Supply | null = null;

  constructor(
    private taqueriaService: TaqueriaService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) { }

  ngOnInit(): void {
    this.loadSupplies();
    this.loadSuppliers();
  }

  loadSupplies() {
    this.taqueriaService.getSupplies().subscribe(data => this.supplies = data);
  }

  loadSuppliers() {
    this.taqueriaService.getSuppliers().subscribe(data => this.suppliers = data);
  }

  getEmptySupply(): Supply {
    return {
      name: '',
      unit: 'Unidad',
      cost: 0,
      stock: 0,
      minStock: 5
    };
  }

  openNew() {
    this.supply = this.getEmptySupply();
    this.submitted = false;
    this.supplyDialog = true;
  }

  editSupply(supply: Supply) {
    this.supply = { ...supply };
    this.supplyDialog = true;
  }

  deleteSupply(supply: Supply) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete ' + supply.name + '?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        if (supply.id) {
          this.taqueriaService.deleteSupply(supply.id).subscribe(() => {
            this.loadSupplies();
            this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Supply Deleted', life: 3000 });
          });
        }
      }
    });
  }

  hideDialog() {
    this.supplyDialog = false;
    this.submitted = false;
  }

  saveSupply() {
    this.submitted = true;

    if (this.supply.name.trim()) {
      this.taqueriaService.saveSupply(this.supply).subscribe(() => {
        this.loadSupplies();
        this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Supply Saved', life: 3000 });
        this.supplyDialog = false;
        this.supply = this.getEmptySupply();
      });
    }
  }

  // Stock Transaction Logic
  openTransactionDialog(supply: Supply, type: 'IN' | 'OUT') {
    this.selectedSupplyForTransaction = supply;
    this.transaction = { type: type, quantity: 0, reason: '', supplyId: supply.id };
    this.transactionDialog = true;
  }

  saveTransaction() {
    if (this.transaction.quantity > 0) {
      this.taqueriaService.addInventoryTransaction(this.transaction).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Transaction Recorded' });
          this.transactionDialog = false;
          this.loadSupplies(); // Reload to check stock
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to record transaction' });
        }
      });
    }
  }

  openKardex(supply: Supply) {
    this.selectedSupplyForKardex = supply;
    this.kardexDialog = true;
  }
}
