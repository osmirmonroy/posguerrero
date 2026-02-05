import { Component, OnInit } from '@angular/core';
import { Supplier } from '../../models/taqueria.models';
import { TaqueriaService } from '../../services/taqueria.service';
import { MessageService, ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-supplier-crud',
  templateUrl: './supplier-crud.component.html',
  styleUrls: ['./supplier-crud.component.css']
})
export class SupplierCrudComponent implements OnInit {
  suppliers: Supplier[] = [];
  supplierDialog: boolean = false;
  supplier: Supplier = { name: '' };
  submitted: boolean = false;

  constructor(
    private taqueriaService: TaqueriaService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) { }

  ngOnInit(): void {
    this.loadSuppliers();
  }

  loadSuppliers() {
    this.taqueriaService.getSuppliers().subscribe(data => this.suppliers = data);
  }

  openNew() {
    this.supplier = { name: '' };
    this.submitted = false;
    this.supplierDialog = true;
  }

  editSupplier(sup: Supplier) {
    this.supplier = { ...sup };
    this.supplierDialog = true;
  }

  deleteSupplier(sup: Supplier) {
    this.confirmationService.confirm({
      message: 'Delete ' + sup.name + '?',
      accept: () => {
        if (sup.id) {
          this.taqueriaService.deleteSupplier(sup.id).subscribe(() => {
            this.messageService.add({ severity: 'success', summary: 'Deleted' });
            this.loadSuppliers();
          });
        }
      }
    });
  }

  saveSupplier() {
    this.submitted = true;
    if (this.supplier.name.trim()) {
      this.taqueriaService.saveSupplier(this.supplier).subscribe(() => {
        this.loadSuppliers();
        this.supplierDialog = false;
        this.messageService.add({ severity: 'success', summary: 'Saved' });
      });
    }
  }

  hideDialog() {
    this.supplierDialog = false;
    this.submitted = false;
  }
}
