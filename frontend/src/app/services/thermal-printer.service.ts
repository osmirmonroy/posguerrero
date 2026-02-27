import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';
import { Order, OrderItem } from '../models/taqueria.models';
import { EscPosEncoder } from '../utils/esc-pos-encoder';

@Injectable({
    providedIn: 'root'
})
export class ThermalPrinterService {
    private connectionType: 'bluetooth' | 'usb' | null = null;

    // Bluetooth properties
    private btDevice: any;
    private btCharacteristic: any;

    // USB / Serial properties
    private serialPort: any;
    private serialWriter: any;

    constructor(private messageService: MessageService) { }

    async connectBluetooth(): Promise<boolean> {
        try {
            // @ts-ignore
            if (!navigator.bluetooth) {
                throw new Error('Web Bluetooth API no está soportada en este navegador.');
            }

            // @ts-ignore
            this.btDevice = await navigator.bluetooth.requestDevice({
                filters: [{ services: [0xFF00, 0x18f0] }],
                optionalServices: [0x18f0, 0xFF00]
            });

            const server = await this.btDevice.gatt.connect();
            const services = await server.getPrimaryServices();

            for (const service of services) {
                const characteristics = await service.getCharacteristics();
                for (const char of characteristics) {
                    if (char.properties.write || char.properties.writeWithoutResponse) {
                        this.btCharacteristic = char;
                        this.connectionType = 'bluetooth';
                        this.messageService.add({ severity: 'success', summary: 'Conectado', detail: `Impresora Bluetooth ${this.btDevice.name} conectada.` });
                        return true;
                    }
                }
            }
            throw new Error('No se encontró una característica de escritura en la impresora Bluetooth.');
        } catch (error) {
            console.error('Error connecting to Bluetooth printer:', error);
            this.messageService.add({ severity: 'error', summary: 'Error de Conexión', detail: 'No se pudo conectar a la impresora Bluetooth.' });
            return false;
        }
    }

    async connectUsb(): Promise<boolean> {
        try {
            // @ts-ignore
            if (!navigator.serial) {
                throw new Error('Web Serial API no está soportada en este navegador. Debes usar Chrome o Edge.');
            }

            // @ts-ignore
            this.serialPort = await navigator.serial.requestPort();
            await this.serialPort.open({ baudRate: 9600 }); // Common baud rate for POS printers

            this.serialWriter = this.serialPort.writable.getWriter();
            this.connectionType = 'usb';

            this.messageService.add({ severity: 'success', summary: 'Conectado', detail: 'Impresora USB/COM conectada exitosamente.' });
            return true;
        } catch (error) {
            console.error('Error connecting to USB printer:', error);
            this.messageService.add({ severity: 'error', summary: 'Error de Conexión', detail: 'No se pudo conectar a la impresora USB. Verifica el cable y los permisos.' });
            return false;
        }
    }

    async printRaw(data: Uint8Array): Promise<boolean> {
        if (!this.connectionType) {
            this.messageService.add({ severity: 'warn', summary: 'Sin Conexión', detail: 'Por favor, conecta la impresora (Bluetooth o USB) primero.' });
            return false;
        }

        try {
            if (this.connectionType === 'bluetooth') {
                const chunkSize = 512;
                for (let i = 0; i < data.length; i += chunkSize) {
                    const chunk = data.slice(i, i + chunkSize);
                    await this.btCharacteristic.writeValue(chunk);
                }
            } else if (this.connectionType === 'usb') {
                await this.serialWriter.write(data);
                // The serial connection handles buffering automatically.
            }
            return true;
        } catch (error) {
            console.error('Error printing:', error);
            this.messageService.add({ severity: 'error', summary: 'Error de Impresión', detail: 'Ocurrió un error al enviar datos a la impresora.' });
            return false;
        }
    }

    async disconnect() {
        if (this.connectionType === 'bluetooth' && this.btDevice?.gatt.connected) {
            await this.btDevice.gatt.disconnect();
            this.btCharacteristic = null;
            this.btDevice = null;
        } else if (this.connectionType === 'usb' && this.serialPort) {
            if (this.serialWriter) {
                this.serialWriter.releaseLock();
                this.serialWriter = null;
            }
            await this.serialPort.close();
            this.serialPort = null;
        }
        this.connectionType = null;
    }

    isConnected(): boolean {
        return this.connectionType !== null;
    }

    private getItemTotal(item: OrderItem): number {
        let price = item.product.price;
        if (item.extras) {
            price += item.extras.reduce((sum, e) => sum + e.price, 0);
        }
        return price * item.quantity;
    }

    async printTicket(order: Order) {
        const encoder = new EscPosEncoder();

        encoder
            .align('center')
            .size(true, true)
            .line('Tacos el Guerrero')
            .size(false, false)
            .line('Ricos Tacos Estilo Mexico')
            .line('--------------------------------') // exactly 32 chars
            .align('left')
            .line(`Ticket #: ${order.id || 'N/A'}`)
            .line(`Fecha: ${new Date().toLocaleString()}`)
            .line(`Cliente: ${order.customerName || 'General'}`.substring(0, 32))
            .line('--------------------------------')
            .bold(true)
            .line('Item              Cant.  Total')
            .bold(false);

        order.items.forEach(item => {
            const name = item.product.name.substring(0, 16).padEnd(16);
            const qty = item.quantity.toString().padStart(5);
            const total = this.getItemTotal(item).toFixed(2).padStart(7);
            encoder.line(`${name} ${qty}   $${total}`.substring(0, 32)); // Make sure to fit exactly in 32, total 16 + 1 + 5 + 3 + 7 = 32

            if (item.extras && item.extras.length > 0) {
                item.extras.forEach(extra => {
                    const extraStr = ` + ${extra.name}`;
                    encoder.line(extraStr.substring(0, 32));
                });
            }
        });

        const grandTotal = order.items.reduce((sum, item) => sum + this.getItemTotal(item), 0);

        encoder
            .line('--------------------------------')
            .align('right')
            .bold(true)
            .size(false, true)
            .line(`TOTAL: $${grandTotal.toFixed(2)}`)
            .size(false, false)
            .line(' ')
            .align('center')
            .line('!Gracias por su preferencia!') // Replaced ¡ with ! for safer encoding
            .line(' ')
            .line(' ')
            .cut();

        await this.printRaw(encoder.encode());
    }
}
