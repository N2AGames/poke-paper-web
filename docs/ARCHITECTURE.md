# 🎮 Arquitectura del Sistema Leaderboard

## Diagrama de Flujo

```
┌─────────────────────────────────────────────────────────────────┐
│                    APLICACIÓN ANGULAR                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────┐              ┌─────────────────────────┐  │
│  │  Juego          │              │  Leaderboard            │  │
│  │  (Who is That   │──────────┬─→ │  Component              │  │
│  │   Poké)         │          │   │                         │  │
│  └────────┬────────┘          │   │  • Tabla rankings      │  │
│           │                   │   │  • Filtros             │  │
│           │                   │   │  • Login panel         │  │
│           │              ┌────┴───┤  • Stats               │  │
│           │              │        └─────────────────────────┘  │
│           │              │                                      │
│    ┌──────▼──────────────┼─────────────────────────────────┐   │
│    │  SaveScore Component │                                 │   │
│    │  (Compartido)        │                                 │   │
│    │                      │                                 │   │
│    │  • Mostrar score    │                                 │   │
│    │  • Username input   │                                 │   │
│    │  • Login/Logout     │                                 │   │
│    └──────┬──────────────┼─────────────────────────────────┘   │
│           │              │                                      │
│    ┌──────▼──────────────▼──────────────────────────────────┐  │
│    │  Services Layer                                        │  │
│    │                                                         │  │
│    │  ┌────────────────────────────────────────────────┐   │  │
│    │  │  SupabaseService                               │   │  │
│    │  │  • signInWithGoogle()                          │   │  │
│    │  │  • signOut()                                   │   │  │
│    │  │  • getCurrentUser()                            │   │  │
│    │  │  • Auth State Management                       │   │  │
│    │  └────────────────────────────────────────────────┘   │  │
│    │                                                         │  │
│    │  ┌────────────────────────────────────────────────┐   │  │
│    │  │  LeaderboardService                            │   │  │
│    │  │  • getLeaderboard()                            │   │  │
│    │  │  • saveGameResult()                            │   │  │
│    │  │  • getUserRank()                               │   │  │
│    │  │  • updateScore()                               │   │  │
│    │  │  • getUserBestScore()                          │   │  │
│    │  └────────────────────────────────────────────────┘   │  │
│    │                                                         │  │
│    └────────────────┬──────────────────────────────────────┘   │
│                     │                                            │
└─────────────────────┼────────────────────────────────────────────┘
                      │
                      │ HTTP/WebSockets
                      │
      ┌───────────────▼─────────────────┐
      │                                  │
      │  SUPABASE (Backend)             │
      │                                  │
      │  ┌──────────────────────────┐   │
      │  │  Database                │   │
      │  │  • leaderboard table     │   │
      │  │  • auth.users           │   │
      │  └──────────────────────────┘   │
      │                                  │
      │  ┌──────────────────────────┐   │
      │  │  Auth (OAuth 2.0)        │   │
      │  │  • Google Provider       │   │
      │  │  • Session Management    │   │
      │  └──────────────────────────┘   │
      │                                  │
      │  ┌──────────────────────────┐   │
      │  │  RLS Policies            │   │
      │  │  • Public SELECT         │   │
      │  │  • User INSERT/UPDATE    │   │
      │  └──────────────────────────┘   │
      │                                  │
      └──────────────────────────────────┘
                      │
                      │
      ┌───────────────▼─────────────────┐
      │  Google OAuth Server            │
      │  • User verification            │
      │  • Token generation             │
      └─────────────────────────────────┘
```

## Flujo de Autenticación con Google

```
Usuario
   │
   ├─ Click en "Inicia sesión con Google"
   │
   ├─→ SupabaseService.signInWithGoogle()
   │
   ├─→ Redirige a Google OAuth
   │
   ├─→ Usuario autoriza aplicación
   │
   ├─→ Google redirige a Supabase
   │
   ├─→ Supabase crea sesión
   │
   ├─→ Redirige a /leaderboard
   │
   └─→ Usuario logeado en aplicación
```

## Flujo de Guardado de Puntuación

```
Juego Finaliza
   │
   ├─ score = 1500
   │
   ├─→ SaveScoreComponent mostrado
   │
   ├─→ ¿Usuario logeado?
   │  │
   │  ├─ NO → Mostrar botón Google
   │  │       │
   │  │       ├─→ Usuario hace login
   │  │       │
   │  │       └─→ Continúa con flujo de guardado
   │  │
   │  └─ SÍ → Solicitar nombre de usuario
   │          │
   │          ├─→ Usuario ingresa nombre
   │          │
   │          └─→ Click en "Guardar Puntuación"
   │
   ├─→ LeaderboardService.saveGameResult()
   │
   ├─→ INSERT en tabla leaderboard (Supabase)
   │
   ├─→ Mostrar "¡Puntuación Guardada!"
   │
   ├─→ Botón "Ver Leaderboard"
   │
   └─→ Usuario puede jugar de nuevo o ver leaderboard
```

## Estructura de Datos

### Tabla: leaderboard

```
┌──────────────────────────────────────────────────────────┐
│ leaderboard                                              │
├──────────┬────────┬──────────┬──────────┬────────────────┤
│ id (PK)  │ user_id│ username │ email    │ score          │
│ UUID     │ UUID   │ VARCHAR  │ VARCHAR  │ INTEGER        │
├──────────┼────────┼──────────┼──────────┼────────────────┤
│ game_mode│ created_at      │ updated_at      │ Índices    │
│ VARCHAR  │ TIMESTAMP       │ TIMESTAMP       │ score      │
│          │                 │                 │ user_id    │
│          │                 │                 │ game_mode  │
└──────────┴─────────────────┴─────────────────┴────────────┘
```

## Componentes de la Aplicación

```
src/app/
├── modules/
│   ├── shared/
│   │   ├── config/
│   │   │   └── supabase.config.ts       [Variables de configuración]
│   │   ├── models/
│   │   │   └── leaderboard.model.ts     [Interfaces TypeScript]
│   │   ├── services/
│   │   │   ├── supabase.service.ts      [Gestión de auth & DB]
│   │   │   └── leaderboard.service.ts   [CRUD de leaderboard]
│   │   └── components/
│   │       └── save-score/
│   │           └── save-score.component.ts [UI guardado de score]
│   │
│   ├── leaderboard/
│   │   ├── leaderboard.component.ts     [Página principal]
│   │   ├── leaderboard.component.html   [Tabla de rankings]
│   │   ├── leaderboard.component.css    [Estilos (responsive)]
│   │   ├── leaderboard.routing.ts       [Rutas]
│   │   └── leaderboard.module.ts        [Módulo]
│   │
│   └── who-is-that-poke/
│       └── ...juego existente
│
└── app.routes.ts                        [Rutas principales]
```

## Ciclo de Vida de un Usuario

```
1. PRIMERA VISITA
   │
   ├─→ Visita /leaderboard
   ├─→ Ve tabla vacía o con datos existentes
   └─→ Botón "Inicia sesión con Google"

2. AUTENTICACIÓN
   │
   ├─→ Hace click en login
   ├─→ Se autentica con Google
   └─→ Vuelve a leaderboard logeado

3. JUEGO
   │
   ├─→ Va a /who-is-that-poke
   ├─→ Juega
   └─→ Termina con score

4. GUARDADO DE PUNTUACIÓN
   │
   ├─→ Ingresa su nombre
   ├─→ Guarda puntuación
   └─→ Aparece en leaderboard

5. PRÓXIMAS VISITAS
   │
   ├─→ Sesión persistente
   ├─→ Ya no necesita login
   └─→ Puede guardar más puntuaciones
```

## Seguridad

```
┌─────────────────────────────────────────┐
│  CAPAS DE SEGURIDAD                     │
├─────────────────────────────────────────┤
│                                         │
│ 1. AUTENTICACIÓN (OAuth 2.0)            │
│    • Google verifica identidad          │
│    • Tokens seguros                     │
│    • No se guardan contraseñas          │
│                                         │
│ 2. AUTORIZACIÓN (RLS)                   │
│    • SELECT: Público (todos ven)        │
│    • INSERT: Solo usuario logeado       │
│    • UPDATE: Solo propias entradas      │
│                                         │
│ 3. ENCRIPTACIÓN                         │
│    • HTTPS en tránsito                  │
│    • Tokens JWT encriptados             │
│                                         │
│ 4. VALIDACIÓN                           │
│    • TypeScript types                   │
│    • Validación en servicio             │
│    • CORS configurado                   │
│                                         │
└─────────────────────────────────────────┘
```

## Performance

```
┌─────────────────────────────────────────┐
│  OPTIMIZACIONES                         │
├─────────────────────────────────────────┤
│                                         │
│ • Lazy loading de rutas                 │
│ • OnPush change detection               │
│ • Índices en campos consultados         │
│ • Limit de 100 registros por query      │
│ • Observable patterns con RxJS          │
│ • Componentes standalone (sin módulos)  │
│                                         │
└─────────────────────────────────────────┘
```

## Escalabilidad

Para producción, considera:

1. **Caché**: Redis para leaderboards frecuentes
2. **CDN**: Servir assets desde CDN
3. **Rate Limiting**: Limitar guardado de puntuaciones
4. **Validación Servidor**: Verificar scores en backend
5. **Monitoring**: Sentry, LogRocket para errores
6. **Analytics**: Mixpanel, Google Analytics para engagement

## Tecnologías Utilizadas

```
Frontend:
├── Angular 21 (Standalone Components)
├── RxJS (Reactive Programming)
├── TypeScript
└── Responsive CSS

Backend:
├── Supabase (PostgreSQL)
├── Google OAuth
├── Row Level Security (RLS)
└── Real-time Subscriptions

Herramientas:
├── npm (Package Manager)
├── TypeScript (Type Safety)
└── Angular CLI
```
