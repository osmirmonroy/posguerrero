export interface Product {
    id?: number;
    name: string;
    price: number;
    description: string;
    category?: string;
}

export interface Extra {
    id?: number;
    name: string;
    price: number;
}

export interface OrderItem {
    id?: number;
    product: Product;
    quantity: number;
    extras?: Extra[];
}

export enum OrderStatus {
    OPEN = 'OPEN',
    PREPARING = 'PREPARING',
    READY = 'READY',
    DELIVERED = 'DELIVERED',
    REOPENED = 'REOPENED',
    PAID = 'PAID'
}

export interface Order {
    id?: number;
    customerName?: string;
    tableNumber?: number;
    status?: OrderStatus;
    date?: string;
    total?: number;
    items: OrderItem[];
    // user?: User; // Avoid cyclic dependency if possible, or define User interface
}

export interface SalesReportDTO {
    date: string;
    category: string;
    quantity: number;
    totalSales: number;
}

export interface Shift {
    id?: number;
    userId?: number;
    startTime?: string;
    endTime?: string;
    initialCash: number;
    finalCashDeclared?: number;
    finalCashSystem?: number;
    status: string;
    comments?: string;
}

export interface Supplier {
    id?: number;
    name: string;
    contactName?: string;
    phoneNumber?: string;
    email?: string;
    address?: string;
}

export interface Supply {
    id?: number;
    name: string;
    unit: string;
    cost: number;
    stock: number;
    minStock: number;
    supplier?: Supplier;
}

export interface InventoryTransaction {
    id?: number;
    supply?: Supply;
    type: string; // IN, OUT
    quantity: number;
    date: string;
    reason?: string;
    userId?: number;
}

export interface TopProduct {
    productName: string;
    quantity: number;
    total: number;
}

export interface PaymentMethodStats {
    paymentMethod: string;
    count: number;
    total: number;
}

export interface DashboardSummary {
    dailySalesTotal: number;
    activeOrdersCount: number;
    lowStockItemsCount: number;
}
