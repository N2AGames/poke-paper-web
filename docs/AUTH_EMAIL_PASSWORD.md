# 🔐 Autenticación con Email/Password - Guía Actualizada

## Cambio de Autenticación

Se cambió de **Google OAuth** a **Email/Password** usando Supabase Auth (sin costo).

### ¿Por qué el cambio?

✅ **Gratis** - Sin costo de Google Cloud
✅ **Simple** - Contraseña segura integrada
✅ **Rápido** - Setup instantáneo
✅ **Control total** - Gestiona usuarios directamente

---

## 🚀 Setup (5 minutos)

### 1. Ya está configurado en Supabase

Tu proyecto Supabase ya tiene autenticación de Email/Password habilitada por defecto. ¡No hay que hacer nada!

### 2. Credenciales ya precargadas

Las credenciales de Supabase ya están en:
```
src/app/modules/shared/config/supabase.config.ts
```

### 3. Componentes listos

- **AuthModalComponent** ← Modal de login/registro
- **SaveScoreComponent** ← Componente guardar puntuación
- **LeaderboardComponent** ← Panel principal

---

## 📝 Flujo de Usuario

### 1. Usuario visita la app

```
http://localhost:4200/leaderboard
          ↓
    Ve panel vacío
    Botón "Inicia sesión"
```

### 2. Click en "Inicia sesión"

```
Modal de Login aparece
├── Email
├── Contraseña
└── Link "¿No tienes cuenta? Crear una"
```

### 3. Crear cuenta (primer login)

```
Modal de Registro
├── Email
├── Nombre de usuario
├── Contraseña (mínimo 6 caracteres)
└── Confirmar contraseña
```

### 4. Jugar y guardar puntuación

```
Juega → Termina con score
       ↓
Componente SaveScore aparece
       ↓
Ingresa nombre de usuario (opcional, ya tiene uno)
       ↓
Click "Guardar Puntuación"
       ↓
Puntuación guardada en Leaderboard ✅
```

---

## 🔑 Métodos de Autenticación

### Registrarse

```typescript
async signUp(email: string, password: string, username: string)
```

**Parámetros:**
- `email` - Email válido
- `password` - Mínimo 6 caracteres
- `username` - Nombre de usuario

**Ejemplo:**
```typescript
const result = await supabaseService.signUp(
  'usuario@email.com',
  'miContraseña123',
  'MiNombreUsuario'
);
```

### Iniciar sesión

```typescript
async signIn(email: string, password: string)
```

**Parámetros:**
- `email` - Email registrado
- `password` - Contraseña

**Ejemplo:**
```typescript
const result = await supabaseService.signIn(
  'usuario@email.com',
  'miContraseña123'
);
```

### Cerrar sesión

```typescript
async signOut()
```

---

## 🧪 Probar Localmente

### 1. Instalar dependencias
```bash
npm install
```

### 2. Ejecutar aplicación
```bash
npm start
```

### 3. Acceder a leaderboard
```
http://localhost:4200/leaderboard
```

### 4. Crear cuenta
- Click "Inicia sesión"
- Click "¿No tienes cuenta? Crear una"
- Llena el formulario
- Click "Crear Cuenta"

### 5. Iniciar sesión
- Email y contraseña
- Click "Iniciar Sesión"

---

## 🛡️ Seguridad

### Contraseñas
✅ Encriptadas en Supabase
✅ Mínimo 6 caracteres
✅ Validación en cliente y servidor

### Sesiones
✅ JWT tokens seguros
✅ Persistencia automática
✅ Expiración configurable

### Datos de usuario
✅ Guardados en tabla auth.users
✅ Encriptados en reposo
✅ HTTPS en tránsito

---

## 📊 Base de Datos

### Tabla: auth.users

Gestiona Supabase automáticamente:
```
- id (UUID)
- email (VARCHAR)
- encrypted_password (BYTEA)
- user_metadata (JSONB)
  └── username
- created_at
- updated_at
```

### Tabla: leaderboard

```
- id (UUID)
- user_id (FK → auth.users)
- username (VARCHAR)
- email (VARCHAR)
- score (INTEGER)
- game_mode (VARCHAR)
- created_at
- updated_at
```

---

## 🔄 Flujo Técnico

```
Usuario
  ↓
[Componente] AuthModalComponent
  ↓
[Servicio] SupabaseService.signUp() / signIn()
  ↓
[Backend] Supabase Auth
  ↓
[BD] auth.users table
  ↓
JWT Token retornado
  ↓
[Cliente] Sesión establecida
  ↓
Guardado en Observable (user$)
```

---

## 💾 Usar el Usuario Actual

### En un componente

```typescript
import { SupabaseService } from './services/supabase.service';

export class MyComponent {
  private supabaseService = inject(SupabaseService);
  currentUser = signal<any>(null);

  constructor() {
    // Observable
    this.supabaseService.getUser().subscribe(user => {
      this.currentUser.set(user);
    });

    // O directo
    const user = this.supabaseService.getCurrentUser();
  }
}
```

### Acceder datos del usuario

```typescript
// En observable
this.supabaseService.getUser().subscribe(user => {
  if (user) {
    console.log('Email:', user.email);
    console.log('Username:', user.user_metadata?.username);
    console.log('User ID:', user.id);
  }
});
```

---

## 🎯 Casos de Uso Comunes

### Guardar puntuación (autenticado)

```typescript
const user = this.supabaseService.getCurrentUser();
if (user) {
  await this.leaderboardService.saveGameResult(
    user.user_metadata?.username,
    {
      score: 1500,
      gameMode: 'who-is-that-poke'
    }
  );
}
```

### Verificar si está logeado

```typescript
const user = this.supabaseService.getCurrentUser();
if (user) {
  // Usuario logeado
} else {
  // Usuario no logeado
}
```

### Actualizar metadata del usuario

```typescript
// Supabase permite actualizar user_metadata
// Útil para guardar username, preferencias, etc.
```

---

## 🐛 Troubleshooting

### "Email ya registrado"
- Usa otro email
- O intenta iniciar sesión con ese email

### "Contraseña incorrecta"
- Verifica que escribes bien
- Usa "Olvidé contraseña" (si lo implementas)

### "No puede registrarse"
- Verifica que todos los campos estén llenos
- Contraseña mínimo 6 caracteres
- Las contraseñas deben coincidir

### "Sesión no persiste"
- Verifica que estés en navegador (no SSR)
- Limpia cookies/localStorage
- Reinicia navegador

---

## ✅ Checklist Setup

- [x] Credenciales Supabase configuradas
- [x] SupabaseService con email/password
- [x] AuthModalComponent creado
- [x] SaveScoreComponent actualizado
- [x] LeaderboardComponent actualizado
- [x] Rutas funcionando
- [ ] Probar registro de usuario
- [ ] Probar login
- [ ] Probar guardado de puntuación
- [ ] Probar logout

---

## 📖 Documentación Relacionada

- [LEADERBOARD_SETUP.md](./LEADERBOARD_SETUP.md) - Setup original
- [QUICK_INTEGRATION_GUIDE.md](./QUICK_INTEGRATION_GUIDE.md) - Integración
- [USAGE_EXAMPLES.md](./USAGE_EXAMPLES.md) - Ejemplos de código

---

**Sistema de autenticación listo para usar! 🎉**
