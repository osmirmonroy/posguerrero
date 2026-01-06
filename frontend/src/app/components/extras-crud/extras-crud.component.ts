import { Component, OnInit } from '@angular/core';
import { Extra } from '../../models/taqueria.models';
import { TaqueriaService } from '../../services/taqueria.service';
import { ConfirmationService, MessageService } from 'primeng/api';

@Component({
    selector: 'app-extras-crud',
    templateUrl: './extras-crud.component.html',
    styleUrls: ['./extras-crud.component.css']
})
export class ExtrasCrudComponent implements OnInit {
    extras: Extra[] = [];
    extra: Extra = { name: '', price: 0 };
    submitted: boolean = false;
    extraDialog: boolean = false;
    deleteExtraDialog: boolean = false;

    constructor(
        private taqueriaService: TaqueriaService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) { }

    ngOnInit(): void {
        this.loadExtras();
    }

    loadExtras() {
        this.taqueriaService.getExtras().subscribe(data => {
            this.extras = data;
        });
    }

    openNew() {
        this.extra = { name: '', price: 0 };
        this.submitted = false;
        this.extraDialog = true;
    }

    editExtra(extra: Extra) {
        this.extra = { ...extra };
        this.extraDialog = true;
    }

    deleteExtra(extra: Extra) {
        this.deleteExtraDialog = true;
        this.extra = { ...extra };
    }

    confirmDelete() {
        this.deleteExtraDialog = false;
        if (this.extra.id) {
            this.taqueriaService.deleteExtra(this.extra.id).subscribe(() => {
                this.messageService.add({ severity: 'success', summary: 'Exitoso', detail: 'Extra Eliminado', life: 3000 });
                this.loadExtras();
                this.extra = { name: '', price: 0 };
            });
        }
    }

    hideDialog() {
        this.extraDialog = false;
        this.submitted = false;
    }

    saveExtra() {
        this.submitted = true;

        if (this.extra.name.trim()) {
            this.taqueriaService.saveExtra(this.extra).subscribe(() => {
                this.messageService.add({ severity: 'success', summary: 'Exitoso', detail: 'Extra Guardado', life: 3000 });
                this.loadExtras();
                this.extraDialog = false;
                this.extra = { name: '', price: 0 };
            });
        }
    }
}
