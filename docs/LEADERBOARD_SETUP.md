# Guía de Configuración del Leaderboard con Supabase

## 1. Configuración de Supabase

### Crear un proyecto en Supabase

1. Ve a [https://supabase.com](https://supabase.com) y crea una cuenta
2. Crea un nuevo proyecto
3. Copia tu **URL del proyecto** y **Anon Key** de las settings del proyecto

### Crear la tabla de Leaderboard

En el SQL Editor de Supabase, ejecuta el siguiente script:

```sql
-- Crear tabla de leaderboard
CREATE TABLE leaderboard (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  email TEXT,
  score INTEGER NOT NULL,
  game_mode TEXT NOT NULL DEFAULT 'who-is-that-poke',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejorar la performance
CREATE INDEX idx_leaderboard_user_id ON leaderboard(user_id);
CREATE INDEX idx_leaderboard_score ON leaderboard(score DESC);
CREATE INDEX idx_leaderboard_game_mode ON leaderboard(game_mode);
CREATE INDEX idx_leaderboard_created_at ON leaderboard(created_at DESC);

-- Habilitar RLS (Row Level Security)
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;

-- Política para que todos puedan leer
CREATE POLICY "Leaderboard is viewable by everyone" ON leaderboard
  FOR SELECT USING (true);

-- Política para que los usuarios puedan crear sus propias entradas
CREATE POLICY "Users can insert their own leaderboard entries" ON leaderboard
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política para que los usuarios puedan actualizar sus propias entradas
CREATE POLICY "Users can update their own leaderboard entries" ON leaderboard
  FOR UPDATE USING (auth.uid() = user_id);
```

### Configurar Google OAuth

1. En Supabase, ve a **Authentication** → **Providers**
2. Habilita Google como provider
3. Ve a Google Cloud Console y crea un proyecto OAuth
4. Obtén tu Google Client ID y Client Secret
5. Copia estas credenciales en Supabase

## 2. Configuración de la Aplicación

### Actualizar archivo de configuración

Edita `src/app/modules/shared/config/supabase.config.ts`:

```typescript
export const SUPABASE_CONFIG = {
  url: 'https://YOUR_PROJECT_ID.supabase.co',
  key: 'YOUR_ANON_KEY'
};
```

### Variables de Entorno (Opcional)

Puedes usar variables de entorno creando un archivo `environment.ts`:

```typescript
export const environment = {
  production: false,
  supabase: {
    url: process.env['NG_APP_SUPABASE_URL'] || '',
    key: process.env['NG_APP_SUPABASE_KEY'] || ''
  }
};
```

## 3. Integración en tu juego

Para guardar un resultado del juego en el leaderboard, usa el servicio `LeaderboardService`:

```typescript
import { LeaderboardService } from './modules/shared/services/leaderboard.service';

// En tu componente del juego
constructor(private leaderboardService: LeaderboardService) {}

async saveScore() {
  try {
    const result = await this.leaderboardService.saveGameResult(
      'TuNombre',
      {
        score: 1500,
        gameMode: 'who-is-that-poke',
        difficulty: 'hard'
      }
    );
    console.log('Puntuación guardada:', result);
  } catch (error) {
    console.error('Error guardando puntuación:', error);
  }
}
```

## 4. Métodos disponibles del LeaderboardService

### Obtener leaderboard global
```typescript
const entries = await this.leaderboardService.getLeaderboard(100, 'who-is-that-poke');
```

### Obtener leaderboard personal del usuario
```typescript
const userEntries = await this.leaderboardService.getUserLeaderboard();
```

### Guardar resultado
```typescript
const entry = await this.leaderboardService.saveGameResult('Username', {
  score: 1500,
  gameMode: 'who-is-that-poke'
});
```

### Obtener ranking del usuario
```typescript
const rank = await this.leaderboardService.getUserRank(userId, 'who-is-that-poke');
```

### Obtener mejor puntuación del usuario
```typescript
const bestScore = await this.leaderboardService.getUserBestScore(userId, 'who-is-that-poke');
```

## 5. Rutas disponibles

- **Leaderboard**: `/leaderboard`
- **Juego**: `/who-is-that-poke`

## 6. Próximos pasos (Opcional)

Para integrar el botón de "Guardar puntuación" en tu juego:

1. Añade un evento cuando el usuario termine una partida
2. Verifica si el usuario está autenticado
3. Si no lo está, muestra un modal para que inicie sesión
4. Guarda la puntuación en el leaderboard
5. Redirige al usuario al leaderboard o muestra un modal de confirmación

Ejemplo en el componente del juego:

```typescript
async finishGame(score: number) {
  const user = this.supabaseService.getCurrentUser();
  
  if (!user) {
    // Mostrar modal de login
    this.showLoginModal = true;
  } else {
    // Guardar puntuación
    const username = this.gameUsername || user.email?.split('@')[0] || 'Anonymous';
    await this.leaderboardService.saveGameResult(username, {
      score,
      gameMode: 'who-is-that-poke'
    });
    // Mostrar confirmación y redirigir
  }
}
```
