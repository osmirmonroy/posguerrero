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
}

export interface SalesReportDTO {
    date: string;
    category: string;
    quantity: number;
    totalSales: number;
}
