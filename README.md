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
- **Generación 1**: Pokémons de primera generación.
- **Modo clásico**: Pokémons de los juegos clásicos (Gen 1, 2 y 3).
- **Modo completo**: Pokémons de todas las generaciones (Gen 1-9).
- **Nuevo modo de juego: Desafío diario:**: Mismo pokemon para todo el mundo.

### 2. **Carta Flip (Flip Card)**
- Muestra una **imagen silhueteada** del Pokémon
- La imagen se tiñe con el color predominante del Pokémon para dar pistas visuales
- Al revelar la respuesta, se muestra la imagen a color del Pokémon
- **Responsiva**: Adapta su tamaño según el dispositivo (móvil, tablet, desktop)

### 3. **Sistema de Adivinanza**
- **Input Autocomplete**: Campo de entrada con autocompletado de nombres de Pokémon
- El jugador digita su respuesta (nombre del Pokémon)
- **Validación**: Compara la respuesta del jugador con el nombre correcto
- Permite verificar si la respuesta es correcta o incorrecta

### 4. **Acciones del Jugador**

#### Enviar Respuesta
- Compara la entrada del usuario con el nombre del Pokémon
- Muestra un mensaje: **"Correct! It's [nombre]!"** o **"Wrong! It was [nombre]."**
- Revela la imagen completa del Pokémon

#### Saltar (Skip)
- Permite al jugador pasar sin adivinar
- Muestra el mensaje: **"Skipped! It was [nombre]."**
- Revela la imagen del Pokémon

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
- Renderiza la imagen del Pokémon
- Aplicar efecto de sombra/silhueta
- Tintado dinámico según el color del Pokémon
- Responsivo con adaptación a diferentes tamaños de pantalla

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
│   │   │   │   ├── flip-card/          # Tarjeta volteadora
│   │   │   │   └── input-auto/         # Input con autocompletado
│   │   │   ├── services/
│   │   │   │   └── pokemon-data.service.ts  # Servicio de API
│   │   │   └── models/
│   │   │       ├── card-info.model.ts
│   │   │       └── pokemon-api.model.ts
│   │   └── who-is-that-poke/
│   │       ├── components/
│   │       │   ├── who-is-that-poke/   # Lógica principal
│   │       │   └── game-config/        # Selección de generación
│   │       └── who-is-that-poke.routing.module.ts
│   ├── app.ts
│   ├── app.routes.ts
│   └── app.config.ts
└── styles.css
```

## 🚀 Características Implementadas

- ✅ Integración con PokéAPI
- ✅ Selección de generaciones (dificultad)
- ✅ Visualización responsiva de tarjetas
- ✅ Sistema de adivinanza con validación
- ✅ Autocompletado de nombres de Pokémon
- ✅ Mensajes de resultado (correcto/incorrecto/saltado)
- ✅ Carga de nuevos Pokémon aleatorios
- ✅ Soporte para Server-Side Rendering (SSR)
- ✅ Deployment en GitHub Pages

## 🚀 Características por implementar

- **Nuevo modo de juego: Doble amenaza**:
    - Se mostrarán dos siluetas superpuestas y el usuario deberá adivinar los pokemons ocultos.
    - A medida que se fallen pokemons las dos siluetas se irán diferenciando (cambiando de color o separándose).
- **Tabla de puntuaciones y estadísticas de acierto**

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

- **Responsividad**: Se adapta a cualquier tamaño de pantalla (móvil, tablet, desktop)
- **Tintado dinámico**: Las tarjetas se colorean según el Pokémon para dar pistas visuales
- **Efectos visuales**: Animaciones de flip y reveal
- **Silhuetas**: Efecto de sombra para mantener el misterio hasta la respuesta

## 📱 Compatibilidad

- Navegadores modernos (Chrome, Firefox, Safari, Edge)
- Dispositivos móviles y tablets
- Server-Side Rendering compatible

## 🤝 Dependencias Principales

- **@angular/core** - Framework Angular
- **@angular/forms** - Forms reactivos
- **@angular/router** - Enrutamiento
- **@angular/ssr** - Server-Side Rendering
- **rxjs** - Programación reactiva
- **express** - Servidor backend para SSR

---

**¡Que disfrutes adivinando Pokémon!** 🎮✨