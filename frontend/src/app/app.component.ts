import { Component, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  items: MenuItem[] = [];

  constructor(private authService: AuthService) { }

  ngOnInit() {
    this.authService.currentUser.subscribe(user => {
      this.updateMenu(user);
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
        label: 'Menú',
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
          label: 'Admin Productos',
          icon: 'pi pi-fw pi-cog',
          routerLink: '/admin/products'
        },
        {
          label: 'Admin Extras',
          icon: 'pi pi-fw pi-plus-circle',
          routerLink: '/admin/extras'
        },
        {
          label: 'Reporte Ventas',
          icon: 'pi pi-fw pi-chart-bar',
          routerLink: '/admin/reports/sales'
        },
        {
          label: 'Usuarios',
          icon: 'pi pi-fw pi-users',
          routerLink: '/users'
        }
      );
    }

    this.items.push({
      label: 'Logout',
      icon: 'pi pi-fw pi-sign-out',
      command: () => this.authService.logout()
    });
  }
}
