export class EscPosEncoder {
    private encoder = new TextEncoder();
    private buffer: number[] = [];

    constructor() {
        this.reset();
    }

    reset(): EscPosEncoder {
        this.buffer = [0x1B, 0x40]; // ESC @ (Initialize printer)
        return this;
    }

    text(content: string): EscPosEncoder {
        // Sanitize string to remove accents and replace special characters with standard ASCII
        const sanitizedContent = content.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const bytes = this.encoder.encode(sanitizedContent);
        bytes.forEach(b => this.buffer.push(b));
        return this;
    }

    line(content: string = ''): EscPosEncoder {
        this.text(content + '\n');
        return this;
    }

    bold(enabled: boolean): EscPosEncoder {
        this.buffer.push(0x1B, 0x45, enabled ? 1 : 0); // ESC E n
        return this;
    }

    align(position: 'left' | 'center' | 'right'): EscPosEncoder {
        const posMap = { 'left': 0, 'center': 1, 'right': 2 };
        this.buffer.push(0x1B, 0x61, posMap[position]); // ESC a n
        return this;
    }

    size(doubleHeight: boolean, doubleWidth: boolean): EscPosEncoder {
        let n = 0;
        if (doubleHeight) n |= 0x10;
        if (doubleWidth) n |= 0x20;
        this.buffer.push(0x1D, 0x21, n); // GS ! n
        return this;
    }

    cut(): EscPosEncoder {
        this.buffer.push(0x1D, 0x56, 0x41, 0x03); // GS V A n
        return this;
    }

    encode(): Uint8Array {
        return new Uint8Array(this.buffer);
    }
}
