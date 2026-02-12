import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MenuComponent } from './components/menu/menu.component';
import { OrderListComponent } from './components/order-list/order-list.component';
import { UserListComponent } from './components/user-list/user-list.component';
import { UserFormComponent } from './components/user-form/user-form.component';
import { ProductCrudComponent } from './components/product-crud/product-crud.component';
import { CategoryCrudComponent } from './components/category-crud/category-crud.component';
import { ExtrasCrudComponent } from './components/extras-crud/extras-crud.component';
import { SalesReportComponent } from './components/sales-report/sales-report.component';
import { LoginComponent } from './components/login/login.component';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';
import { KitchenDashboardComponent } from './components/kitchen-dashboard/kitchen-dashboard.component';
import { ShiftControlComponent } from './components/shift-control/shift-control.component';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { InventoryListComponent } from './components/inventory-list/inventory-list.component';
import { SupplierCrudComponent } from './components/supplier-crud/supplier-crud.component';
import { BranchListComponent } from './components/branch-list/branch-list.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: '', redirectTo: 'menu', pathMatch: 'full' },
  { path: 'menu', component: MenuComponent, canActivate: [AuthGuard] },
  { path: 'orders', component: OrderListComponent, canActivate: [AuthGuard] },
  { path: 'admin/products', component: ProductCrudComponent, canActivate: [AuthGuard, RoleGuard], data: { expectedRole: 'ADMIN' } },
  { path: 'admin/categories', component: CategoryCrudComponent, canActivate: [AuthGuard, RoleGuard], data: { expectedRole: 'ADMIN' } },
  { path: 'admin/extras', component: ExtrasCrudComponent, canActivate: [AuthGuard, RoleGuard], data: { expectedRole: 'ADMIN' } },
  { path: 'admin/reports/sales', component: SalesReportComponent, canActivate: [AuthGuard, RoleGuard], data: { expectedRole: 'ADMIN' } },
  { path: 'users', component: UserListComponent, canActivate: [AuthGuard, RoleGuard], data: { expectedRole: 'ADMIN' } },
  { path: 'users/new', component: UserFormComponent, canActivate: [AuthGuard, RoleGuard], data: { expectedRole: 'ADMIN' } },
  { path: 'users/new', component: UserFormComponent, canActivate: [AuthGuard, RoleGuard], data: { expectedRole: 'ADMIN' } },
  { path: 'users/edit/:id', component: UserFormComponent, canActivate: [AuthGuard, RoleGuard], data: { expectedRole: 'ADMIN' } },
  { path: 'inventory/supplies', component: InventoryListComponent, canActivate: [AuthGuard, RoleGuard], data: { expectedRole: 'ADMIN' } },
  { path: 'admin/suppliers', component: SupplierCrudComponent, canActivate: [AuthGuard, RoleGuard], data: { expectedRole: 'ADMIN' } },
  { path: 'kitchen', component: KitchenDashboardComponent, canActivate: [AuthGuard, RoleGuard], data: { expectedRole: 'COCINERO' } },
  { path: 'shifts', component: ShiftControlComponent, canActivate: [AuthGuard] },
  { path: 'admin/dashboard', component: AdminDashboardComponent, canActivate: [AuthGuard, RoleGuard], data: { expectedRole: 'ADMIN' } },
  { path: 'admin/branches', component: BranchListComponent, canActivate: [AuthGuard, RoleGuard], data: { expectedRole: 'ADMIN' } }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
