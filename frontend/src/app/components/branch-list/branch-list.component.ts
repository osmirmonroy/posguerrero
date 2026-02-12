import { Component, OnInit } from '@angular/core';
import { Branch, BranchService } from '../../services/branch.service';
import { ConfirmationService, MessageService } from 'primeng/api';

@Component({
    selector: 'app-branch-list',
    templateUrl: './branch-list.component.html',
    providers: [MessageService, ConfirmationService]
})
export class BranchListComponent implements OnInit {
    branches: Branch[] = [];
    branchDialog: boolean = false;
    branch: Branch = { name: '', isActive: true };
    submitted: boolean = false;

    constructor(
        private branchService: BranchService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) { }

    ngOnInit() {
        this.loadBranches();
    }

    loadBranches() {
        this.branchService.getAllBranches().subscribe((data: Branch[]) => {
            this.branches = data;
        });
    }

    openNew() {
        this.branch = { name: '', isActive: true };
        this.submitted = false;
        this.branchDialog = true;
    }

    editBranch(branch: Branch) {
        this.branch = { ...branch };
        this.branchDialog = true;
    }

    deleteBranch(branch: Branch) {
        this.confirmationService.confirm({
            message: '¿Estás seguro de eliminar ' + branch.name + '?',
            header: 'Confirmar',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                if (branch.id) {
                    this.branchService.deleteBranch(branch.id).subscribe(() => {
                        this.messageService.add({ severity: 'success', summary: 'Exitoso', detail: 'Sucursal eliminada', life: 3000 });
                        this.loadBranches();
                    });
                }
            }
        });
    }

    hideDialog() {
        this.branchDialog = false;
        this.submitted = false;
    }

    saveBranch() {
        this.submitted = true;

        if (this.branch.name.trim()) {
            if (this.branch.id) {
                this.branchService.updateBranch(this.branch.id, this.branch).subscribe(() => {
                    this.messageService.add({ severity: 'success', summary: 'Exitoso', detail: 'Sucursal actualizada', life: 3000 });
                    this.loadBranches();
                    this.branchDialog = false;
                    this.branch = { name: '', isActive: true };
                });
            } else {
                this.branchService.createBranch(this.branch).subscribe(() => {
                    this.messageService.add({ severity: 'success', summary: 'Exitoso', detail: 'Sucursal creada', life: 3000 });
                    this.loadBranches();
                    this.branchDialog = false;
                    this.branch = { name: '', isActive: true };
                });
            }
        }
    }
}
