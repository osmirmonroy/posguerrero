import { Component, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { AuthService } from './services/auth.service';
import { BranchService, Branch } from './services/branch.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  items: MenuItem[] = [];
  currentUser: any;
  branches: Branch[] = [];
  selectedBranchId: number | null = null;

  constructor(
    private authService: AuthService,
    private branchService: BranchService
  ) { }

  ngOnInit() {
    // Subscribe to selected branch changes
    this.branchService.selectedBranch$.subscribe(branchId => {
      this.selectedBranchId = branchId;
    });

    // Subscribe to current user changes
    this.authService.currentUser.subscribe(user => {
      this.currentUser = user;
      this.updateMenu(user);

      // Load branches if user is ADMIN
      if (user && user.role === 'ADMIN') {
        this.loadBranches();
      } else {
        this.branches = [];
        this.branchService.clearSelectedBranch();
      }
    });
  }

  updateMenu(user: any) {
    this.items = [];

    if (!user) {
      this.items.push({
        label: 'Login',
        icon: 'pi pi-fw pi-sign-in',
        routerLink: '/login'
      });
      return;
    }

    this.items.push(
      {
        label: 'Crear Orden',
        icon: 'pi pi-fw pi-list',
        routerLink: '/menu'
      },
      {
        label: 'Pedidos',
        icon: 'pi pi-fw pi-history',
        routerLink: '/orders'
      }
    );

    if (user.role === 'ADMIN') {
      this.items.push(
        {
          label: 'Dashboard',
          icon: 'pi pi-fw pi-home',
          routerLink: '/admin/dashboard'
        },
        {
          label: 'Catálogos',
          icon: 'pi pi-fw pi-list',
          items: [
            { label: 'Productos', icon: 'pi pi-fw pi-cog', routerLink: '/admin/products' },
            { label: 'Categorías', icon: 'pi pi-fw pi-tags', routerLink: '/admin/categories' },
            { label: 'Extras', icon: 'pi pi-fw pi-plus-circle', routerLink: '/admin/extras' },
            { label: 'Usuarios', icon: 'pi pi-fw pi-users', routerLink: '/users' },
            { label: 'Sucursales', icon: 'pi pi-fw pi-building', routerLink: '/admin/branches' }
          ]
        },

        {
          label: 'Inventario',
          icon: 'pi pi-fw pi-box',
          items: [
            { label: 'Insumos & Stock', icon: 'pi pi-fw pi-list', routerLink: '/inventory/supplies' },
            { label: 'Proveedores', icon: 'pi pi-fw pi-users', routerLink: '/admin/suppliers' }
          ]
        },
        {
          label: 'Reporte Ventas',
          icon: 'pi pi-fw pi-chart-bar',
          routerLink: '/admin/reports/sales'
        },

      );
    }

    if (user.role === 'COCINERO' || user.role === 'ADMIN') {
      this.items.push({
        label: 'Cocina',
        icon: 'pi pi-fw pi-inbox',
        routerLink: '/kitchen'
      });
    }

    this.items.push({
      label: 'Turnos',
      icon: 'pi pi-fw pi-clock',
      routerLink: '/shifts'
    });

    this.items.push({
      label: 'Logout',
      icon: 'pi pi-fw pi-sign-out',
      command: () => {
        this.branchService.clearSelectedBranch();
        this.authService.logout();
      }
    });
  }

  loadBranches() {
    this.branchService.getAllBranches().subscribe(branches => {
      this.branches = branches.filter(b => b.isActive);
    });
  }

  onBranchChange() {
    this.branchService.setSelectedBranch(this.selectedBranchId);
  }
}
