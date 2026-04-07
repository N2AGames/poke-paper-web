export class Utils {

    private static readonly PAPER_TONE = { r: 242, g: 237, b: 216 };
    private static readonly PASTEL_TYPE_WEIGHT = 0.38;

    static readonly GENERATION_LIMITS = [151, 251, 386, 493, 649, 721, 809, 905, 1025];

    static readonly GENERATION_COLOR_MAP: { [key: string]: string } = {
        'gen-1': '#e05c5c',
        'gen-2': '#d4a017',
        'gen-3': '#3a8f3a',
        'gen-4': '#2060cc',
        'gen-5': '#c05000',
        'gen-6': '#8040c0',
        'gen-7': '#00a080',
        'gen-8': '#0070a0',
        'gen-9': '#c0306a',
    };

    static readonly REGIONAL_FORM_GENERATION: { [key: string]: number } = {
        'alola': 7,
        'galar': 8,
        'hisui': 8,
        'paldea': 9,
    };

    static getGenerationFromId(id: number): number {
        for (let i = 0; i < this.GENERATION_LIMITS.length; i++) {
            if (id <= this.GENERATION_LIMITS[i]) return i + 1;
        }
        return 9;
    }

    static getGenerationFromPokemonName(name: string, id: number): number {
        const parts = name.split('-');
        for (const part of parts.slice(1)) {
            if (this.REGIONAL_FORM_GENERATION[part] !== undefined) {
                return this.REGIONAL_FORM_GENERATION[part];
            }
        }
        return this.getGenerationFromId(id);
    }

    static isGenerationLabel(text: string): boolean {
        return /^gen-\d+$/.test(text);
    }

    static getPastelColorByGeneration(_gen: string): string {
        const baseColor = this.normalizeHexColor('#5566aa');
        return this.pastelizeColor(baseColor);
    }

    static TYPE_COLOR_MAP: { [key: string]: string } = {
        normal:   '#A8A060',
        fire:     '#FF5500',
        water:    '#0066FF',
        electric: '#FFD700',
        grass:    '#22BB33',
        ice:      '#44DDCC',
        fighting: '#DD2200',
        poison:   '#9900BB',
        ground:   '#CC8833',
        flying:   '#88AAFF',
        psychic:  '#FF1188',
        bug:      '#779900',
        rock:     '#886644',
        ghost:    '#553388',
        dragon:   '#4400CC',
        dark:     '#445555',
        steel:    '#AABBCC',
        fairy:    '#FF88BB'
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

    static getPastelColorByType(type: string, weight?: number): string {
        const baseColor = this.normalizeHexColor(this.getColorByType(type));
        return this.pastelizeColor(baseColor, weight);
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

    static pastelizeColor(hexColor: string, weight?: number): string {
        const normalizedColor = this.normalizeHexColor(hexColor);
        const red = Number.parseInt(normalizedColor.slice(1, 3), 16);
        const green = Number.parseInt(normalizedColor.slice(3, 5), 16);
        const blue = Number.parseInt(normalizedColor.slice(5, 7), 16);

        const w = weight ?? this.PASTEL_TYPE_WEIGHT;
        const mixedRed = Math.round(red * w + this.PAPER_TONE.r * (1 - w));
        const mixedGreen = Math.round(green * w + this.PAPER_TONE.g * (1 - w));
        const mixedBlue = Math.round(blue * w + this.PAPER_TONE.b * (1 - w));

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