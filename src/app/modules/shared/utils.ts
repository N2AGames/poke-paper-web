export class Utils {

    private static readonly PAPER_TONE = { r: 242, g: 237, b: 216 };
    private static readonly PASTEL_TYPE_WEIGHT = 0.38;

    static TYPE_COLOR_MAP: { [key: string]: string } = {
        normal: '#c0be61',
        fire: '#e96500',
        water: '#004df3',
        electric: '#fbff00',
        grass: '#5dc521',
        ice: '#96D9D6',
        fighting: '#bd06008f',
        poison: '#8500b9',
        ground: '#b17e1f',
        flying: '#00eeff',
        psychic: '#d400ff',
        bug: '#869700',
        rock: '#663a00',
        ghost: '#2b2336',
        dragon: '#2d00a0',
        dark: '#303030',
        steel: '#B7B7CE',
        fairy: '#ff0080'
    };

    static AVOID_COLORS: string[] = [
        '#FFFFFF', // blanco
        '#4D5253', // gris oscuro
    ];

    static GAME_MODES = [
        { key: '1gen', label: 'Primera Generación' },
        { key: 'classic', label: 'Clásico' },
        { key: 'all', label: 'Todos' },
        { key: 'daily', label: 'Diario' },
        { key: 'poke-table', label: 'Poke Table' }
    ];

    static getColorByType(type: string): string {
        return this.TYPE_COLOR_MAP[type] || '#ffffff';
    }

    static getPastelColorByType(type: string): string {
        const baseColor = this.normalizeHexColor(this.getColorByType(type));
        return this.pastelizeColor(baseColor);
    }

    static getReadableTextColor(backgroundColor: string): string {
        const normalizedColor = this.normalizeHexColor(backgroundColor);
        const red = Number.parseInt(normalizedColor.slice(1, 3), 16);
        const green = Number.parseInt(normalizedColor.slice(3, 5), 16);
        const blue = Number.parseInt(normalizedColor.slice(5, 7), 16);

        const luminance = (0.299 * red + 0.587 * green + 0.114 * blue) / 255;
        return luminance > 0.6 ? '#111' : '#fff';
    }

    static normalizeHexColor(color: string): string {
        const cleanColor = color.replace('#', '');

        if (cleanColor.length === 3) {
            const expanded = cleanColor.split('').map((char) => `${char}${char}`).join('');
            return `#${expanded}`;
        }

        if (cleanColor.length === 6 || cleanColor.length === 8) {
            return `#${cleanColor.slice(0, 6)}`;
        }

        return '#bbb8a0';
    }

    static pastelizeColor(hexColor: string): string {
        const normalizedColor = this.normalizeHexColor(hexColor);
        const red = Number.parseInt(normalizedColor.slice(1, 3), 16);
        const green = Number.parseInt(normalizedColor.slice(3, 5), 16);
        const blue = Number.parseInt(normalizedColor.slice(5, 7), 16);

        const mixedRed = Math.round(red * this.PASTEL_TYPE_WEIGHT + this.PAPER_TONE.r * (1 - this.PASTEL_TYPE_WEIGHT));
        const mixedGreen = Math.round(green * this.PASTEL_TYPE_WEIGHT + this.PAPER_TONE.g * (1 - this.PASTEL_TYPE_WEIGHT));
        const mixedBlue = Math.round(blue * this.PASTEL_TYPE_WEIGHT + this.PAPER_TONE.b * (1 - this.PASTEL_TYPE_WEIGHT));

        return `#${this.toHex(mixedRed)}${this.toHex(mixedGreen)}${this.toHex(mixedBlue)}`;
    }

    static toHex(value: number): string {
        return value.toString(16).padStart(2, '0');
    }

    static async tintImage(element: HTMLImageElement, colors: string[]): Promise<void> {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.src = element.src;

        img.onload = function() {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d') || new CanvasRenderingContext2D();
            
            const stauration = 0.4;

            canvas.width = img.width;
            canvas.height = img.height;

            // 1. Dibujar imagen original
            ctx.drawImage(img, 0, 0);

            // 2. Obtener los datos de los píxeles
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;

            // Convertir el color Hex/RGB a valores numéricos
            const tints = colors.map(color => Utils.hexToRgb(color));

            // 3. Iterar sobre los píxeles (de 4 en 4: R, G, B, A)
            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];

                // Umbral para definir qué es "blanco" (255 es blanco puro)
                // Usamos 240 para incluir blancos que no sean perfectos
                const colorRgb = Utils.rgbToHex(r, g, b).toUpperCase();
                const isWhite = Utils.AVOID_COLORS.includes(colorRgb);

                if (!isWhite) {
                    // Aplicar el tinte (mezcla simple al porcentaje establecido)
                    // Elegir un color de tinte basado en la posición del píxel
                    // - Lado izquierdo arriba usa el primer color
                    // - Lado derecho arriba usa el segundo color (si existe)
                    // - Lado izquierdo abajo usa el tercer color (si existe)
                    // - Lado derecho abajo usa el cuarto color (si existe)
                    const x = (i / 4) % canvas.width;
                    const y = Math.floor((i / 4) / canvas.width);
                    const tintIndex = (x < canvas.width / 2 ? 0 : 1) + (y < canvas.height / 2 ? 0 : 2);
                    const tint = tints[Math.min(tintIndex, tints.length - 1)];
                    data[i]     = r * 0.6 + tint.r * stauration;
                    data[i + 1] = g * 0.6 + tint.g * stauration;
                    data[i + 2] = b * 0.6 + tint.b * stauration;
                }
            }

            // 4. Volver a poner los píxeles modificados en el canvas
            ctx.putImageData(imageData, 0, 0);
            element.src = canvas.toDataURL();
        };
    }

    // Función auxiliar para convertir color a RGB
    static hexToRgb(hex: string): { r: number; g: number; b: number } {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 0, g: 0, b: 0 };
    }

    static rgbToHex(r: number, g: number, b: number): string {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
    }
}