import { Component, OnInit } from '@angular/core';
import { Product } from '../../models/taqueria.models';
import { TaqueriaService } from '../../services/taqueria.service';
import { Branch, BranchService } from '../../services/branch.service';
import { ConfirmationService, MessageService } from 'primeng/api';

@Component({
  selector: 'app-product-crud',
  templateUrl: './product-crud.component.html',
  styleUrls: ['./product-crud.component.css']
})
export class ProductCrudComponent implements OnInit {
  products: Product[] = [];
  product: Product = { name: '', price: 0, description: '', category: '' };
  selectedProducts: Product[] = [];
  categories: any[] = [];
  submitted: boolean = false;
  productDialog: boolean = false;
  deleteProductDialog: boolean = false;

  // Pricing Dialog Code
  pricingDialog: boolean = false;
  currentProductForPricing: Product | null = null;
  branches: Branch[] = [];
  branchPrices: { [key: number]: number } = {}; // Map branchId -> price

  constructor(
    private taqueriaService: TaqueriaService,
    private branchService: BranchService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) { }

  ngOnInit(): void {
    this.loadProducts();
    this.loadBranches();
    this.loadCategories();
  }

  loadCategories() {
    this.taqueriaService.getCategories().subscribe(data => {
      this.categories = data.map(c => ({ label: c.name, value: c.name }));
    });
  }

  loadProducts() {
    this.taqueriaService.getProducts().subscribe(data => {
      this.products = data;
    });
  }

  loadBranches() {
    this.branchService.getAllBranches().subscribe(data => {
      this.branches = data;
    });
  }

  openNew() {
    this.product = { name: '', price: 0, description: '', category: '' };
    this.branchPrices = {}; // Reset branch prices
    this.branches.forEach(b => {
      if (b.id) this.branchPrices[b.id] = 0; // Initialize with 0 or base price
    });
    this.submitted = false;
    this.productDialog = true;
  }

  editProduct(product: Product) {
    this.product = { ...product };
    this.productDialog = true;
  }

  deleteProduct(product: Product) {
    this.deleteProductDialog = true;
    this.product = { ...product };
  }

  confirmDelete() {
    this.deleteProductDialog = false;
    if (this.product.id) {
      this.taqueriaService.deleteProduct(this.product.id).subscribe(() => {
        this.messageService.add({ severity: 'success', summary: 'Exitoso', detail: 'Producto Eliminado', life: 3000 });
        this.loadProducts();
        this.product = { name: '', price: 0, description: '', category: '' };
      });
    }
  }

  hideDialog() {
    this.productDialog = false;
    this.submitted = false;
  }

  saveProduct() {
    this.submitted = true;

    if (this.product.name.trim()) {
      // Check if creating new product
      if (!this.product.id) {
        // Prepare DTO-like object if we were strict types, but here we simply attach map
        const payload = { ...this.product, branchPrices: this.branchPrices };
        this.taqueriaService.createProduct(payload).subscribe(() => {
          this.messageService.add({ severity: 'success', summary: 'Exitoso', detail: 'Producto Creado', life: 3000 });
          this.loadProducts();
          this.productDialog = false;
          this.product = { name: '', price: 0, description: '', category: '' };
        });
      } else {
        // Update existing
        this.taqueriaService.saveProduct(this.product).subscribe(() => {
          this.messageService.add({ severity: 'success', summary: 'Exitoso', detail: 'Producto Actualizado', life: 3000 });
          this.loadProducts();
          this.productDialog = false;
          this.product = { name: '', price: 0, description: '', category: '' };
        });
      }
    }
  }

  openPricingDialog(product: Product) {
    this.currentProductForPricing = product;
    this.branchPrices = {};

    // Initialize with base price for all branches
    this.branches.forEach(b => {
      if (b.id) this.branchPrices[b.id] = product.price;
    });

    // Fetch existing overrides
    if (product.id) {
      this.taqueriaService.getProductBranchPrices(product.id).subscribe(prices => {
        if (prices) {
          Object.keys(prices).forEach(branchId => {
            this.branchPrices[Number(branchId)] = prices[Number(branchId)];
          });
        }
      });
    }

    this.pricingDialog = true;
  }

  saveBranchPrice(branchId: number) {
    if (this.currentProductForPricing && this.currentProductForPricing.id) {
      const price = this.branchPrices[branchId];
      this.taqueriaService.setBranchPrice(this.currentProductForPricing.id, branchId, price).subscribe(() => {
        this.messageService.add({ severity: 'success', summary: 'Precio Actualizado', detail: `Precio guardado para sucursal ${branchId}` });
      });
    }
  }
}
