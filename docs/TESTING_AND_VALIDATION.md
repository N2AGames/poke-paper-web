# Testing y Validación del Leaderboard

## Validar sin Supabase (Modo Mock)

Si quieres probar localmente sin configurar Supabase aún:

### Crear un mock service temporal

Crea `src/app/modules/shared/services/supabase.service.mock.ts`:

```typescript
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SupabaseServiceMock {
  private userSubject = new BehaviorSubject<any>(null);
  public user$ = this.userSubject.asObservable();

  async signInWithGoogle() {
    // Mock user login
    this.userSubject.next({
      id: 'mock-user-id',
      email: 'usuario@example.com',
      user_metadata: { name: 'Usuario Demo' }
    });
  }

  async signOut() {
    this.userSubject.next(null);
  }

  getUser(): Observable<any> {
    return this.user$;
  }

  getCurrentUser() {
    return this.userSubject.value;
  }
}
```

## Checklist de Testing

### 1. Pantalla de Leaderboard
- [ ] La página carga sin errores
- [ ] Se muestra la tabla con columnas: Ranking, Jugador, Puntuación, Modo, Fecha
- [ ] Hay un botón "Inicia sesión con Google"
- [ ] El dropdown de filtro por modo funciona

### 2. Autenticación
- [ ] El botón de Google redirige correctamente
- [ ] El usuario se logea y aparece su nombre/email
- [ ] El botón de logout funciona
- [ ] El nombre del usuario es persistente

### 3. Guardado de Puntuaciones (después de integrar)
- [ ] Se puede guardar una puntuación desde el juego
- [ ] La puntuación aparece en el leaderboard
- [ ] Se ordena correctamente por puntuación
- [ ] El usuario aparece con su nombre

### 4. Responsivo
- [ ] En desktop: se ven todas las columnas
- [ ] En tablet: se mantiene legible
- [ ] En móvil: se ocultan columnas no esenciales
- [ ] Los botones son clickeables

### 5. Errores
- [ ] Se muestra mensaje si no hay conexión con Supabase
- [ ] Se muestra mensaje si falla el login
- [ ] Se muestra mensaje si falla el guardado de puntuación

## Comandos para testing

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm start

# Abrir en navegador
# http://localhost:4200/leaderboard

# Compilar para producción
npm run build

# Correr tests unitarios
npm test
```

## URLs de Testing

- Leaderboard: `http://localhost:4200/leaderboard`
- Juego: `http://localhost:4200/who-is-that-poke`

## Datos de prueba en Supabase

Para agregar datos de prueba en Supabase SQL Editor:

```sql
INSERT INTO leaderboard (user_id, username, email, score, game_mode, created_at, updated_at)
VALUES
  ('550e8400-e29b-41d4-a716-446655440000', 'JugadorDemo1', 'demo1@example.com', 9500, 'who-is-that-poke', NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440001', 'JugadorDemo2', 'demo2@example.com', 8750, 'who-is-that-poke', NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440002', 'JugadorDemo3', 'demo3@example.com', 7200, 'who-is-that-poke', NOW(), NOW());
```

## Troubleshooting

### Error: "Cannot find module '@supabase/supabase-js'"
- Ejecutar: `npm install @supabase/supabase-js`

### Error: "signInWithGoogle is not a function"
- Verificar que la configuración de Supabase es correcta
- Verificar que Google OAuth está habilitado en Supabase

### El leaderboard está vacío
- Verificar que hay datos en la tabla `leaderboard`
- Verificar que las políticas de RLS permiten leer (SELECT)

### Login con Google no funciona
- Verificar que el redirect URL es correcto en Supabase
- Verificar que el Google Client ID es válido
- Revisar la consola del navegador para errores

### Puntuación no se guarda
- Verificar que el usuario está autenticado
- Verificar que la tabla tiene la estructura correcta
- Verificar políticas de RLS permiten INSERT

## Performance

El leaderboard está optimizado para:
- Cargar máximo 100 registros por defecto
- Usar índices en campos de búsqueda
- Lazy loading de rutas
- OnPush change detection en componentes

## Seguridad

✅ Las políticas de RLS están habilitadas
✅ Solo los usuarios pueden ver sus propias entradas (configurable)
✅ Los tokens de Supabase no están expuestos
✅ Google OAuth es seguro con servidor OAuth

## Próximos pasos de producción

Antes de ir a producción:

1. [ ] Usar variables de entorno para las credenciales
2. [ ] Configurar CORS en Supabase
3. [ ] Pruebas end-to-end
4. [ ] Monitoring de errores (Sentry)
5. [ ] Rate limiting en guardado de puntuaciones
6. [ ] Validación de puntuaciones en servidor
