
import { Component, OnInit } from '@angular/core';
import { Category } from '../../models/taqueria.models';
import { TaqueriaService } from '../../services/taqueria.service';
import { ConfirmationService, MessageService } from 'primeng/api';

@Component({
    selector: 'app-category-crud',
    templateUrl: './category-crud.component.html',
    styleUrls: ['./category-crud.component.css']
})
export class CategoryCrudComponent implements OnInit {
    categories: Category[] = [];
    category: Category = { name: '', description: '' };
    categoryDialog: boolean = false;
    deleteCategoryDialog: boolean = false;
    submitted: boolean = false;

    constructor(
        private taqueriaService: TaqueriaService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) { }

    ngOnInit(): void {
        this.loadCategories();
    }

    loadCategories() {
        this.taqueriaService.getCategories().subscribe(data => {
            this.categories = data;
        });
    }

    openNew() {
        this.category = { name: '', description: '' };
        this.submitted = false;
        this.categoryDialog = true;
    }

    editCategory(category: Category) {
        this.category = { ...category };
        this.categoryDialog = true;
    }

    deleteCategory(category: Category) {
        this.deleteCategoryDialog = true;
        this.category = { ...category };
    }

    confirmDelete() {
        this.deleteCategoryDialog = false;
        if (this.category.id) {
            this.taqueriaService.deleteCategory(this.category.id).subscribe(() => {
                this.messageService.add({ severity: 'success', summary: 'Exitoso', detail: 'Categoría Eliminada', life: 3000 });
                this.loadCategories();
                this.category = { name: '', description: '' };
            });
        }
    }

    hideDialog() {
        this.categoryDialog = false;
        this.submitted = false;
    }

    saveCategory() {
        this.submitted = true;

        if (this.category.name.trim()) {
            this.taqueriaService.saveCategory(this.category).subscribe(() => {
                this.messageService.add({ severity: 'success', summary: 'Exitoso', detail: 'Categoría Guardada', life: 3000 });
                this.loadCategories();
                this.categoryDialog = false;
                this.category = { name: '', description: '' };
            });
        }
    }
}
