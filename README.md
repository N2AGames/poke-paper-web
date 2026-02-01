# 🎮 Poke Paper Web

Un juego interactivo basado en Pokémon desarrollado con **Angular 21** que desafía a los jugadores a adivinar la identidad de diferentes Pokémon según su apariencia visual.

## 📋 Descripción del Proyecto

**Poke Paper Web** es una aplicación web moderna que combina entretenimiento y nostalgia del universo Pokémon. El proyecto utiliza la [PokéAPI](https://pokeapi.co/) para obtener datos e imágenes de Pokémon reales, permitiendo una experiencia de juego dinámica y siempre fresca.

### Stack Tecnológico

- **Framework**: Angular 21.0.0
- **Lenguaje**: TypeScript 5.9.2
- **Styling**: CSS
- **SSR**: Angular SSR para Server-Side Rendering
- **API Externa**: PokéAPI (https://pokeapi.co/api/v2/pokemon/)
- **Deployment**: GitHub Pages

## 🎯 Mecánicas Principales del Juego

### 1. **Selección de modo**
El jugador puede seleccionar el modo de juego:
- **Generación 1**: Pokémons de primera generación (1-151).
- **Modo clásico**: Pokémons de los juegos clásicos (Gen 1-3, hasta el 386).
- **Modo completo**: Pokémons de todas las generaciones (Gen 1-9, hasta el 1025).
- **Desafío diario**: Mismo Pokémon para todos los jugadores durante todo el día. El Pokémon se genera de forma determinista basado en la fecha actual.
- **Doble Amenaza**: Modo especial donde se muestran dos siluetas de Pokémon superpuestas que el jugador debe adivinar. Al acertar uno de ellos, su sombra se revela individualmente.

### 2. **Carta Flip (Flip Card)**
- Muestra una **imagen silhueteada** del Pokémon
- La imagen se tiñe con el color predominante del Pokémon para dar pistas visuales
- Al revelar la respuesta, se muestra la imagen a color del Pokémon
- **Responsiva**: Adapta su tamaño según el dispositivo (móvil, tablet, desktop)

### 3. **Sistema de Adivinanza**
- **Input Autocomplete**: Campo de entrada con autocompletado de nombres de Pokémon (hasta 1025 Pokémon)
- El jugador escribe su respuesta (nombre del Pokémon)
- **Validación inteligente**: 
  - En modo normal: Compara la respuesta con el nombre correcto
  - En modo Doble Amenaza: Permite adivinar múltiples Pokémon y revela cada uno individualmente
- Retroalimentación inmediata sobre la respuesta

### 4. **Acciones del Jugador**

#### Enviar Respuesta
- Compara la entrada del usuario con el nombre del Pokémon
- **Modo normal**: Muestra mensaje **"Correct! It was [nombre]!"** o **"Wrong! It was [nombre]."** y revela la imagen completa
- **Modo Doble Amenaza**: 
  - Si acierta uno de los Pokémon, muestra **"Correct! You found [nombre]! Keep going!"** y revela solo ese Pokémon
  - Al acertar ambos, muestra **"Correct! You found all: [nombre1] + [nombre2]!"**
  - Si falla, revela ambos Pokémon con mensaje **"Wrong! It was [nombre1] + [nombre2]."**
- Reproduce el grito característico (cry) del Pokémon al revelarlo

#### Saltar (Skip)
- Permite al jugador pasar sin adivinar
- Muestra el mensaje: **"Skipped! It was [nombre]."**
- Revela la imagen completa del Pokémon (o ambos en modo Doble Amenaza)
- Reproduce los gritos de los Pokémon revelados

#### Siguiente Pokémon
- Carga un nuevo Pokémon aleatorio
- Restablece el estado: remueve mensaje de resultado, vuelve a sombrear la imagen, limpia el input
- El ciclo se repite

### 5. **Componentes Principales**

#### **WhoIsThatPoke** (Componente Principal)
- Gestiona la lógica del juego
- Controla la selección de generación
- Maneja el flujo: adivinar → resultado → siguiente

#### **FlipCard** (Componente de Tarjeta)
- Renderiza la imagen del Pokémon (o múltiples en modo Doble Amenaza)
- Aplica efecto de sombra/silueta con opción de revelado individual o completo
- Tintado dinámico según los colores de tipo del Pokémon
- Reproducción de audio con el grito característico (cry) del Pokémon
- Responsivo con adaptación a diferentes tamaños de pantalla
- Soporte para múltiples Pokémon superpuestos

#### **InputAuto** (Componente de Entrada)
- Campo de entrada con autocompletado
- Listado dinámico de Pokémon disponibles
- Validación de entrada

#### **GameConfig** (Componente de Configuración)
- Selector de dificultad por generación
- Interface de selección de modo de juego

## 📦 Estructura del Proyecto

```
src/
├── app/
│   ├── modules/
│   │   ├── shared/
│   │   │   ├── components/
│   │   │   │   ├── flip-card/          # Tarjeta volteadora con soporte multi-Pokémon
│   │   │   │   └── input-auto/         # Input con autocompletado
│   │   │   ├── services/
│   │   │   │   └── pokemon-data.service.ts  # Servicio de API con modos de juego
│   │   │   ├── models/
│   │   │   │   ├── card-info.model.ts       # Modelo de información de tarjeta
│   │   │   │   └── pokemon-api.model.ts     # Modelo de respuesta de PokéAPI
│   │   │   └── utils.ts                     # Utilidades (colores por tipo, etc.)
│   │   └── who-is-that-poke/
│   │       ├── components/
│   │       │   ├── who-is-that-poke/   # Componente principal del juego
│   │       │   └── game-config/        # Selección de modo de juego
│   │       └── who-is-that-poke.routing.module.ts
│   ├── app.ts
│   ├── app.routes.ts
│   └── app.config.ts
└── styles.css
```

## 🔧 Detalles Técnicos

### Servicios
**PokemonDataService**: Gestiona todas las interacciones con PokéAPI
- `getPokemonData(name)`: Obtiene datos de un Pokémon específico
- `getPokemonDataRandom(generation)`: Obtiene un Pokémon aleatorio según la generación
- `getDailyPokemonData()`: Genera un Pokémon determinista basado en la fecha actual
- `getRandomPokemons(amount)`: Obtiene múltiples Pokémon aleatorios
- `getAllPokemonNames()`: Obtiene lista completa de nombres para autocompletado

### Límites por Generación
- Gen 1: 151 Pokémon
- Gen 2: 251 Pokémon  
- Gen 3: 386 Pokémon
- Gen 4: 493 Pokémon
- Gen 5: 649 Pokémon
- Gen 6: 721 Pokémon
- Gen 7: 809 Pokémon
- Gen 8: 905 Pokémon
- Gen 9: 1025 Pokémon

### Modos de Juego
- `1gen`: Primera generación (1-151)
- `classics`: Generaciones clásicas (1-386)
- `all`: Todas las generaciones (1-1025)
- `daily`: Pokémon diario determinista

### Características Avanzadas
- **Change Detection Strategy**: OnPush para optimización de rendimiento
- **Platform Detection**: Soporte SSR con detección de plataforma (Browser/Server)
- **Signals API**: Uso de Signals de Angular para gestión reactiva de estado
- **Lazy Loading**: Carga bajo demanda de recursos

## 🚀 Características Implementadas

- ✅ Integración con PokéAPI (hasta 1025 Pokémon)
- ✅ Selección de generaciones (Gen 1, Gen 1-3, Gen 1-9)
- ✅ Modo Desafío Diario (mismo Pokémon para todos los jugadores cada día)
- ✅ Modo Doble Amenaza (adivina dos Pokémon superpuestos)
- ✅ Visualización responsiva de tarjetas con adaptación automática al tamaño de pantalla
- ✅ Sistema de adivinanza con validación inteligente
- ✅ Autocompletado de nombres de Pokémon (1025 nombres)
- ✅ Mensajes de resultado contextuales (correcto/incorrecto/saltado)
- ✅ Carga de nuevos Pokémon aleatorios por generación
- ✅ Tintado dinámico basado en tipos de Pokémon
- ✅ Reproducción de audio (cries/gritos de Pokémon)
- ✅ Revelado individual o completo de siluetas
- ✅ Soporte para Server-Side Rendering (SSR)
- ✅ Deployment en GitHub Pages
- ✅ Detección de plataforma (Browser/Server) para optimización SSR

## 🚀 Características por implementar

- **Sistema de puntuación y estadísticas**:
    - Tabla de puntuaciones (leaderboard)
    - Estadísticas de acierto por jugador
    - Racha de aciertos consecutivos
- **Modos de juego adicionales**:
    - Modo contra reloj
    - Modo multijugador

## 🛠️ Instalación y Ejecución

### Instalación de dependencias
```bash
npm install
```

### Desarrollo local
```bash
npm start
```
Abre http://localhost:4200/ en tu navegador.

### Build para producción
```bash
npm run build
```

### Deploy en GitHub Pages
```bash
npm run deploy
```

## 📝 Scripts Disponibles

| Script | Descripción |
|--------|-------------|
| `npm start` | Inicia el servidor de desarrollo |
| `npm run build` | Compila para producción |
| `npm run test` | Ejecuta los tests unitarios |
| `npm run watch` | Compilación en modo watch |
| `npm run deploy` | Deploy automático en GitHub Pages |

## 🎨 Características de Diseño

- **Responsividad**: Se adapta automáticamente a cualquier tamaño de pantalla
  - Móvil (< 400px): 60vw
  - Tablet (400-600px): 40vw  
  - Tablet grande (600-800px): 30vw
  - Desktop pequeño (800-1000px): 20vw
  - Desktop (> 1000px): 15vw
- **Tintado dinámico**: Las tarjetas se colorean según los tipos del Pokémon para dar pistas visuales
- **Efectos visuales**: Animaciones de flip, reveal y transiciones suaves
- **Silhuetas inteligentes**: Efecto de sombra con revelado progresivo en modo Doble Amenaza
- **Audio interactivo**: Reproducción de gritos (cries) característicos de cada Pokémon
- **Signals de Angular**: Uso de Signals para gestión reactiva de estado

## 📱 Compatibilidad

- Navegadores modernos (Chrome, Firefox, Safari, Edge)
- Dispositivos móviles y tablets
- Server-Side Rendering compatible

## 🤝 Dependencias Principales

- **@angular/core** (21.0.0) - Framework Angular
- **@angular/forms** (21.0.0) - Forms reactivos
- **@angular/router** (21.0.0) - Enrutamiento
- **@angular/ssr** (21.0.5) - Server-Side Rendering
- **@angular/platform-browser** (21.0.0) - Plataforma para navegadores
- **@angular/platform-server** (21.0.0) - Plataforma para servidor
- **rxjs** (7.8.0) - Programación reactiva
- **express** (5.1.0) - Servidor backend para SSR
- **typescript** (5.9.2) - Lenguaje tipado

### Dependencias de Desarrollo
- **@angular/build** (21.0.5) - Sistema de build
- **@angular/cli** (21.0.5) - Herramientas de línea de comandos
- **gh-pages** (6.3.0) - Deployment a GitHub Pages
- **jsdom** (27.1.0) - Testing de DOM en Node.js

---

**¡Que disfrutes adivinando Pokémon!** 🎮✨