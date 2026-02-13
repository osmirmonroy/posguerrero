import { Component, OnInit } from '@angular/core';
import { Supply, Supplier } from '../../models/taqueria.models';
import { TaqueriaService } from '../../services/taqueria.service';
import { BranchService } from '../../services/branch.service';
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
    private branchService: BranchService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) { }

  ngOnInit(): void {
    this.branchService.selectedBranch$.subscribe(branchId => {
      this.loadSupplies(branchId || undefined);
    });
    this.loadSuppliers();
  }

  loadSupplies(branchId?: number) {
    this.taqueriaService.getSupplies(branchId).subscribe(data => this.supplies = data);
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
      message: '¿Está seguro de que desea eliminar ' + supply.name + '?',
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        if (supply.id) {
          this.taqueriaService.deleteSupply(supply.id).subscribe(() => {
            this.loadSupplies();
            this.messageService.add({ severity: 'success', summary: 'Exitoso', detail: 'Insumo Eliminado', life: 3000 });
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
        this.messageService.add({ severity: 'success', summary: 'Exitoso', detail: 'Insumo Guardado', life: 3000 });
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
          this.messageService.add({ severity: 'success', summary: 'Exitoso', detail: 'Movimiento Registrado' });
          this.transactionDialog = false;
          this.loadSupplies(); // Reload to check stock
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo registrar el movimiento' });
        }
      });
    }
  }

  openKardex(supply: Supply) {
    this.selectedSupplyForKardex = supply;
    this.kardexDialog = true;
  }
}
