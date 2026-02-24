import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { registerLocaleData } from '@angular/common';
import localeEsMx from '@angular/common/locales/es-MX';
import { LOCALE_ID } from '@angular/core';
import { JwtInterceptor } from './interceptors/jwt.interceptor';
import { LoadingInterceptor } from './interceptors/loading.interceptor';

registerLocaleData(localeEsMx);

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MenuComponent } from './components/menu/menu.component';
import { OrderListComponent } from './components/order-list/order-list.component';

import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DataViewModule } from 'primeng/dataview';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { MenubarModule } from 'primeng/menubar';
import { ToolbarModule } from 'primeng/toolbar';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { CheckboxModule } from 'primeng/checkbox';
import { DividerModule } from 'primeng/divider';
import { DropdownModule } from 'primeng/dropdown';
import { SelectButtonModule } from 'primeng/selectbutton';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { BadgeModule } from 'primeng/badge';
import { PasswordModule } from 'primeng/password';
import { MessageModule } from 'primeng/message';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ProductCrudComponent } from './components/product-crud/product-crud.component';
import { CategoryCrudComponent } from './components/category-crud/category-crud.component';
import { ExtrasCrudComponent } from './components/extras-crud/extras-crud.component';
import { SalesReportComponent } from './components/sales-report/sales-report.component';
import { CalendarModule } from 'primeng/calendar';
import { MultiSelectModule } from 'primeng/multiselect';
import { ChartModule } from 'primeng/chart';
import { TabViewModule } from 'primeng/tabview';
import { LoginComponent } from './components/login/login.component';
import { UserListComponent } from './components/user-list/user-list.component';
import { UserFormComponent } from './components/user-form/user-form.component';
import { KitchenDashboardComponent } from './components/kitchen-dashboard/kitchen-dashboard.component';
import { ShiftControlComponent } from './components/shift-control/shift-control.component';
import { InventoryListComponent } from './components/inventory-list/inventory-list.component';
import { SupplierCrudComponent } from './components/supplier-crud/supplier-crud.component';
import { KardexViewComponent } from './components/kardex-view/kardex-view.component';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { BranchListComponent } from './components/branch-list/branch-list.component';
import { LoadingSpinnerComponent } from './components/loading-spinner/loading-spinner.component';

@NgModule({
  declarations: [
    AppComponent,
    MenuComponent,
    OrderListComponent,
    ProductCrudComponent,
    CategoryCrudComponent,
    ExtrasCrudComponent,
    SalesReportComponent,
    LoginComponent,
    UserListComponent,
    UserFormComponent,
    KitchenDashboardComponent,
    ShiftControlComponent,
    InventoryListComponent,
    SupplierCrudComponent,
    KardexViewComponent,
    AdminDashboardComponent,
    BranchListComponent,
    LoadingSpinnerComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    CardModule,
    DataViewModule,
    TableModule,
    InputTextModule,
    InputNumberModule,
    MenubarModule,
    ToolbarModule,
    DialogModule,
    ConfirmDialogModule,
    ToastModule,
    CheckboxModule,
    DividerModule,
    DropdownModule,
    SelectButtonModule,
    OverlayPanelModule,
    BadgeModule,
    PasswordModule,
    MessageModule,
    CalendarModule,
    MultiSelectModule,
    ChartModule,
    TabViewModule
  ],
  providers: [
    MessageService,
    ConfirmationService,
    { provide: LOCALE_ID, useValue: 'es-MX' },
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: LoadingInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
