export class Utils {

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

    static getColorByType(type: string): string {
        return this.TYPE_COLOR_MAP[type] || '#ffffff';
    }

    static async tintImage(element: HTMLImageElement, color: string): Promise<void> {
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
            const tint = Utils.hexToRgb(color);

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