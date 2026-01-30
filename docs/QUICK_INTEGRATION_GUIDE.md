# Integración Rápida del Leaderboard en Who is That Poké

## Paso 1: Agregar el componente SaveScore al juego

### Editar `src/app/modules/who-is-that-poke/components/who-is-that-poke/who-is-that-poke.component.ts`

```typescript
import { SaveScoreComponent } from '../../../shared/components/save-score/save-score.component';

@Component({
  selector: 'app-who-is-that-poke',
  imports: [FlipCard, InputAuto, SaveScoreComponent], // ✅ Agregar aquí
  templateUrl: './who-is-that-poke.component.html',
  styleUrls: ['./who-is-that-poke.component.css', '../../../../app.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WhoIsThatPoke implements OnInit, OnDestroy {
  // ... código existente ...
  
  // Agregar estas señales
  isGameOver = signal(false);
  finalScore = signal(0);

  finishGame(score: number) {
    this.finalScore.set(score);
    this.isGameOver.set(true);
  }

  onScoreSubmitted() {
    // Aquí puedes hacer algo después de que se guarde la puntuación
    console.log('Score submitted to leaderboard');
    // Opcional: Redirigir o mostrar un modal
  }
}
```

## Paso 2: Actualizar el template del juego

### Editar `src/app/modules/who-is-that-poke/components/who-is-that-poke/who-is-that-poke.component.html`

Agregar esto al final del template (cuando el juego termina):

```html
<!-- Mostrar componente de guardar puntuación cuando el juego termina -->
@if (isGameOver()) {
  <app-save-score 
    [score]="finalScore()" 
    (scoreSubmitted)="onScoreSubmitted()">
  </app-save-score>
}
```

## Paso 3: Actualizar el template para mostrar un botón de reinicio

```html
@if (isGameOver()) {
  <div class="game-over-actions">
    <button (click)="resetGame()" class="btn btn-reset">
      Jugar de Nuevo
    </button>
  </div>
  <app-save-score 
    [score]="finalScore()" 
    (scoreSubmitted)="onScoreSubmitted()">
  </app-save-score>
}
```

## Paso 4: Agregar estilos (opcional)

Agregar a `who-is-that-poke.component.css`:

```css
.game-over-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin: 2rem 0;
}

.btn-reset {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.btn-reset:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}
```

## Ejemplo completo de implementación mínima

```typescript
// En tu método donde termina el juego:
async onGameComplete(score: number) {
  // Detener el temporizador, etc.
  
  // Mostrar el formulario de guardado
  this.finalScore.set(score);
  this.isGameOver.set(true);
}

onScoreSubmitted() {
  // El usuario ya guardó su puntuación
  // Esperar 2 segundos y permitir jugar de nuevo
  setTimeout(() => {
    this.resetGame();
  }, 2000);
}

resetGame() {
  this.isGameOver.set(false);
  this.finalScore.set(0);
  // Reiniciar el juego...
}
```

## Rutas disponibles para el usuario

- `/who-is-that-poke` - Juego principal
- `/leaderboard` - Ver el leaderboard global

## Función completamente integrada

Una vez completados estos pasos:

1. ✅ El usuario juega
2. ✅ Al terminar, ve un formulario para guardar su puntuación
3. ✅ Si no está logeado, le aparece un botón para "Inicia sesión con Google"
4. ✅ Si está logeado, ingresa su nombre y guarda la puntuación
5. ✅ Puede ver el leaderboard desde el botón "Ver Leaderboard"

¡Listo para usar! 🚀
