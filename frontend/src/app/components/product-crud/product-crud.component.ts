import { Component, OnInit } from '@angular/core';
import { Product } from '../../models/taqueria.models';
import { TaqueriaService } from '../../services/taqueria.service';
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

  constructor(
    private taqueriaService: TaqueriaService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) { }

  ngOnInit(): void {
    this.loadProducts();
    this.categories = [
      { label: 'Tacos', value: 'Tacos' },
      { label: 'Tortas', value: 'Tortas' },
      { label: 'Bebidas', value: 'Bebidas' },
      { label: 'Extras', value: 'Extras' },
      { label: 'Postres', value: 'Postres' }
    ];
  }

  loadProducts() {
    this.taqueriaService.getProducts().subscribe(data => {
      this.products = data;
    });
  }

  openNew() {
    this.product = { name: '', price: 0, description: '', category: '' };
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
      this.taqueriaService.saveProduct(this.product).subscribe(() => {
        this.messageService.add({ severity: 'success', summary: 'Exitoso', detail: 'Producto Guardado', life: 3000 });
        this.loadProducts();
        this.productDialog = false;
        this.product = { name: '', price: 0, description: '', category: '' };
      });
    }
  }
}
