import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';

@Injectable({
    providedIn: 'root'
})
export class BluetoothPrintService {
    private device: any;
    private characteristic: any;

    constructor(private messageService: MessageService) { }

    async connect(): Promise<boolean> {
        try {
            // @ts-ignore
            this.device = await navigator.bluetooth.requestDevice({
                filters: [{
                    services: [0xFF00, 0x18f0], // Common generic and printer service UUIDs
                }],
                optionalServices: [0x18f0, 0xFF00]
            });

            const server = await this.device.gatt.connect();

            // Attempt to find the characteristics for printing
            // Thermal printers usually expose a characteristic that supports 'write'
            const services = await server.getPrimaryServices();

            for (const service of services) {
                const characteristics = await service.getCharacteristics();
                for (const char of characteristics) {
                    if (char.properties.write || char.properties.writeWithoutResponse) {
                        this.characteristic = char;
                        this.messageService.add({ severity: 'success', summary: 'Conectado', detail: `Impresora ${this.device.name} conectada.` });
                        return true;
                    }
                }
            }

            throw new Error('No se encontró una característica de escritura en la impresora.');
        } catch (error) {
            console.error('Error connecting to Bluetooth printer:', error);
            this.messageService.add({ severity: 'error', summary: 'Error de Conexión', detail: 'No se pudo conectar a la impresora Bluetooth.' });
            return false;
        }
    }

    async print(data: Uint8Array): Promise<boolean> {
        if (!this.characteristic) {
            const connected = await this.connect();
            if (!connected) return false;
        }

        try {
            // Send data in chunks of 512 bytes (common limitation for thermal printers)
            const chunkSize = 512;
            for (let i = 0; i < data.length; i += chunkSize) {
                const chunk = data.slice(i, i + chunkSize);
                await this.characteristic.writeValue(chunk);
            }
            return true;
        } catch (error) {
            console.error('Error printing:', error);
            this.messageService.add({ severity: 'error', summary: 'Error de Impresión', detail: 'Ocurrió un error al enviar datos a la impresora.' });
            return false;
        }
    }

    async disconnect() {
        if (this.device && this.device.gatt.connected) {
            await this.device.gatt.disconnect();
            this.characteristic = null;
            this.device = null;
        }
    }

    isConnected(): boolean {
        return !!this.characteristic;
    }
}
