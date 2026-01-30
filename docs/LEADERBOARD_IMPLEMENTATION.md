# 📊 Integración Leaderboard - Resumen de Cambios

He integrado completamente un sistema de **Leaderboard con Supabase y autenticación de Google** en tu aplicación Angular. Aquí está todo lo que se ha implementado:

## ✅ Lo que se ha creado

### 1. **Servicios**
- `supabase.service.ts` - Gestión de cliente Supabase y autenticación
- `leaderboard.service.ts` - Todas las operaciones del leaderboard (guardar, obtener, ranking)

### 2. **Modelos**
- `leaderboard.model.ts` - Interfaces para LeaderboardEntry, AuthUser y GameResult

### 3. **Configuración**
- `supabase.config.ts` - Variables de configuración de Supabase

### 4. **Componentes**
- **LeaderboardComponent** - Página principal del leaderboard con:
  - Visualización de rankings globales
  - Filtrado por modo de juego
  - Login/logout con Google
  - Soporte responsive
  - Medallas para top 3 (🥇🥈🥉)

- **SaveScoreComponent** - Componente reutilizable para guardar puntuaciones:
  - Se puede integrar en cualquier juego
  - Manejo de autenticación
  - Guardado de puntuaciones
  - Vínculo directo al leaderboard

### 5. **Rutas**
- Nueva ruta: `/leaderboard`
- Lazy loading configurado

### 6. **Documentación**
- `LEADERBOARD_SETUP.md` - Guía completa de setup
- `.env.example` - Variables de entorno necesarias

## 🚀 Próximos pasos

### 1. Configurar Supabase

1. Ve a [supabase.com](https://supabase.com) y crea un proyecto
2. En SQL Editor, ejecuta el script de `LEADERBOARD_SETUP.md`
3. Obtén tu URL y Anon Key

### 2. Configurar Google OAuth

1. Ve a [Google Cloud Console](https://console.cloud.google.com)
2. Crea un proyecto OAuth
3. Configura el consent screen y credenciales OAuth 2.0
4. En Supabase, habilita Google como provider con tus credenciales

### 3. Actualizar configuración

Edita `src/app/modules/shared/config/supabase.config.ts` con tus credenciales:

```typescript
export const SUPABASE_CONFIG = {
  url: 'https://YOUR_PROJECT_ID.supabase.co',
  key: 'YOUR_ANON_KEY'
};
```

### 4. Integrar en el juego (Opcional)

Para agregar el botón de guardar puntuación en el componente de tu juego:

```typescript
// En who-is-that-poke.component.ts
import { SaveScoreComponent } from '../../../shared/components/save-score/save-score.component';

@Component({
  imports: [FlipCard, InputAuto, SaveScoreComponent], // Agregar aquí
  // ...
})
export class WhoIsThatPoke {
  // ...
  currentScore = signal(0);

  finishGame(score: number) {
    this.currentScore.set(score);
    // Mostrar componente de guardar puntuación
  }
}
```

En el template:

```html
<app-save-score 
  [score]="currentScore()" 
  (scoreSubmitted)="onScoreSubmitted()">
</app-save-score>
```

## 📋 Métodos disponibles

### SupabaseService
```typescript
signInWithGoogle()        // Login con Google
signOut()                 // Logout
getUser()                 // Observable del usuario actual
getCurrentUser()          // Usuario actual
getCurrentSession()       // Sesión actual
```

### LeaderboardService
```typescript
getLeaderboard(limit, gameMode?)           // Obtener leaderboard global
getUserLeaderboard()                       // Obtener del usuario actual
saveGameResult(username, gameResult)       // Guardar puntuación
updateScore(entryId, newScore)            // Actualizar puntuación
getUserRank(userId, gameMode?)            // Obtener ranking del usuario
getUserBestScore(userId, gameMode?)       // Mejor puntuación del usuario
```

## 🎨 Características del Leaderboard

✨ **Diseño moderno** con gradientes
📱 **Responsive** (funciona en móviles, tablets y desktop)
🏆 **Medallas** para las primeras 3 posiciones
🔐 **Autenticación segura** con Google OAuth
📊 **Filtrado** por modo de juego
🔄 **Real-time** con Supabase
♿ **Accesible** con buena estructura semántica

## 🔧 Paquetes instalados

- `@supabase/supabase-js` - Cliente de Supabase
- `@angular/google-maps` - Para soporte de Google

## 📂 Estructura de archivos creados

```
src/app/modules/
├── shared/
│   ├── config/
│   │   └── supabase.config.ts
│   ├── models/
│   │   └── leaderboard.model.ts
│   ├── services/
│   │   ├── supabase.service.ts
│   │   └── leaderboard.service.ts
│   └── components/
│       └── save-score/
│           └── save-score.component.ts
└── leaderboard/
    ├── leaderboard.component.ts
    ├── leaderboard.component.html
    ├── leaderboard.component.css
    ├── leaderboard.component.spec.ts
    ├── leaderboard.routing.ts
    └── leaderboard.module.ts
```

## 🐛 Debugging

Si tienes problemas:

1. **No aparece el leaderboard**: Verifica que las credenciales de Supabase sean correctas
2. **Error en login**: Asegúrate de haber configurado Google OAuth en Google Cloud Console
3. **No se guardan puntuaciones**: Verifica que la tabla de leaderboard existe en Supabase
4. **CORS errors**: Agrega tu dominio a las URLs autorizadas en Supabase

## 📞 Soporte

Revisa `LEADERBOARD_SETUP.md` para la documentación completa con ejemplos SQL y instrucciones detalladas.

¡Tu leaderboard está listo para funcionar! 🚀
