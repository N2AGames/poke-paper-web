export class Utils {

    static TYPE_COLOR_MAP: { [key: string]: string } = {
        normal: '#A8A77A',
        fire: '#EE8130',
        water: '#6390F0',
        electric: '#F7D02C',
        grass: '#7AC74C',
        ice: '#96D9D6',
        fighting: '#C22E28',
        poison: '#A33EA1',
        ground: '#E2BF65',
        flying: '#A98FF3',
        psychic: '#F95587',
        bug: '#A6B91A',
        rock: '#B6A136',
        ghost: '#735797',
        dragon: '#6F35FC',
        dark: '#705746',
        steel: '#B7B7CE',
        fairy: '#D685AD'
    };

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
                const isWhite = r > 240 && g > 240 && b > 240;

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
}