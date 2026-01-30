# 🎮 Ejemplos de Uso del Leaderboard

## Ejemplo 1: Usar SupabaseService para autenticación

```typescript
import { Component, inject } from '@angular/core';
import { SupabaseService } from './services/supabase.service';

@Component({
  selector: 'app-auth-example',
  template: `
    @if (user(); as user) {
      <p>Hola {{ user.email }}</p>
      <button (click)="logout()">Logout</button>
    } @else {
      <button (click)="loginGoogle()">Login con Google</button>
    }
  `
})
export class AuthExampleComponent {
  private supabaseService = inject(SupabaseService);
  user = this.supabaseService.getUser();

  async loginGoogle() {
    try {
      await this.supabaseService.signInWithGoogle();
    } catch (error) {
      console.error('Login failed:', error);
    }
  }

  async logout() {
    try {
      await this.supabaseService.signOut();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }
}
```

## Ejemplo 2: Guardar un resultado de juego

```typescript
import { Component, inject } from '@angular/core';
import { LeaderboardService } from './services/leaderboard.service';
import { SupabaseService } from './services/supabase.service';

@Component({
  selector: 'app-game-result',
  template: `
    <div>
      <h2>Juego Terminado</h2>
      <p>Tu puntuación: {{ score }}</p>
      
      @if (currentUser(); as user) {
        <input 
          type="text" 
          [(ngModel)]="username" 
          placeholder="Tu nombre"
        />
        <button (click)="saveScore()">Guardar Puntuación</button>
      } @else {
        <p>Debes logearte para guardar tu puntuación</p>
        <button (click)="loginGoogle()">Login</button>
      }
      
      @if (message()) {
        <p>{{ message() }}</p>
      }
    </div>
  `
})
export class GameResultComponent {
  private leaderboardService = inject(LeaderboardService);
  private supabaseService = inject(SupabaseService);
  
  score = 1500;
  username = '';
  message = signal('');
  currentUser = this.supabaseService.getUser();

  async saveScore() {
    try {
      this.message.set('Guardando...');
      
      const result = await this.leaderboardService.saveGameResult(
        this.username,
        {
          score: this.score,
          gameMode: 'who-is-that-poke',
          difficulty: 'hard'
        }
      );
      
      this.message.set('¡Puntuación guardada exitosamente!');
      console.log('Resultado guardado:', result);
      
    } catch (error) {
      this.message.set('Error al guardar. Intenta de nuevo.');
      console.error('Error:', error);
    }
  }

  async loginGoogle() {
    try {
      await this.supabaseService.signInWithGoogle();
    } catch (error) {
      console.error('Login failed:', error);
    }
  }
}
```

## Ejemplo 3: Obtener el leaderboard global

```typescript
import { Component, OnInit, inject, signal } from '@angular/core';
import { LeaderboardService } from './services/leaderboard.service';
import { LeaderboardEntry } from './models/leaderboard.model';

@Component({
  selector: 'app-leaderboard-display',
  template: `
    <div>
      <h2>Top 10 Jugadores</h2>
      
      @if (isLoading()) {
        <p>Cargando...</p>
      } @else {
        <table>
          <thead>
            <tr>
              <th>Ranking</th>
              <th>Nombre</th>
              <th>Puntuación</th>
            </tr>
          </thead>
          <tbody>
            @for (entry of entries(); let index = $index) {
              <tr>
                <td>{{ index + 1 }}</td>
                <td>{{ entry.username }}</td>
                <td>{{ entry.score }}</td>
              </tr>
            }
          </tbody>
        </table>
      }
    </div>
  `
})
export class LeaderboardDisplayComponent implements OnInit {
  private leaderboardService = inject(LeaderboardService);
  
  entries = signal<LeaderboardEntry[]>([]);
  isLoading = signal(true);

  async ngOnInit() {
    try {
      const entries = await this.leaderboardService.getLeaderboard(10);
      this.entries.set(entries);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      this.isLoading.set(false);
    }
  }
}
```

## Ejemplo 4: Obtener el ranking del usuario

```typescript
import { Component, OnInit, inject, signal } from '@angular/core';
import { LeaderboardService } from './services/leaderboard.service';
import { SupabaseService } from './services/supabase.service';

@Component({
  selector: 'app-user-stats',
  template: `
    @if (currentUser(); as user) {
      <div class="user-stats">
        <h3>{{ user.email }}</h3>
        
        @if (isLoading()) {
          <p>Cargando estadísticas...</p>
        } @else {
          <p>Tu Ranking: #{{ userRank() }}</p>
          <p>Tu Mejor Puntuación: {{ bestScore() }}</p>
        }
      </div>
    } @else {
      <p>Debes logearte para ver tus estadísticas</p>
    }
  `
})
export class UserStatsComponent implements OnInit {
  private leaderboardService = inject(LeaderboardService);
  private supabaseService = inject(SupabaseService);
  
  currentUser = this.supabaseService.getUser();
  userRank = signal(0);
  bestScore = signal(0);
  isLoading = signal(true);

  async ngOnInit() {
    this.currentUser.subscribe(async (user) => {
      if (user) {
        try {
          const rank = await this.leaderboardService.getUserRank(
            user.id,
            'who-is-that-poke'
          );
          
          const bestScore = await this.leaderboardService.getUserBestScore(
            user.id,
            'who-is-that-poke'
          );
          
          this.userRank.set(rank);
          this.bestScore.set(bestScore);
        } catch (error) {
          console.error('Error loading stats:', error);
        } finally {
          this.isLoading.set(false);
        }
      }
    });
  }
}
```

## Ejemplo 5: Integración completa en un juego

```typescript
import { Component, signal, inject } from '@angular/core';
import { SaveScoreComponent } from './components/save-score/save-score.component';
import { SupabaseService } from './services/supabase.service';
import { LeaderboardService } from './services/leaderboard.service';

@Component({
  selector: 'app-game-container',
  imports: [SaveScoreComponent],
  template: `
    <div class="game-container">
      @if (!isGameOver()) {
        <div class="game-area">
          <!-- Tu juego aquí -->
          <button (click)="endGame(1500)">Terminar juego</button>
        </div>
      } @else {
        <div class="game-result">
          <h2>¡Juego Terminado!</h2>
          
          <!-- Componente de guardar puntuación -->
          <app-save-score 
            [score]="finalScore()"
            (scoreSubmitted)="onScoreSubmitted()">
          </app-save-score>
          
          <!-- Botones de acción -->
          <div class="actions">
            <button (click)="resetGame()">Jugar de Nuevo</button>
            <a href="/leaderboard">Ver Leaderboard</a>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .game-container {
      padding: 2rem;
    }
    
    .game-result {
      text-align: center;
    }
    
    .actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
      margin-top: 2rem;
    }
    
    .actions button,
    .actions a {
      padding: 0.75rem 1.5rem;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 8px;
      text-decoration: none;
      cursor: pointer;
      font-weight: 600;
    }
    
    .actions button:hover,
    .actions a:hover {
      background: #5568d3;
    }
  `]
})
export class GameContainerComponent {
  private supabaseService = inject(SupabaseService);
  private leaderboardService = inject(LeaderboardService);
  
  isGameOver = signal(false);
  finalScore = signal(0);
  userStats = signal<any>(null);

  async endGame(score: number) {
    this.finalScore.set(score);
    this.isGameOver.set(true);
    
    // Cargar estadísticas del usuario si está logeado
    const user = this.supabaseService.getCurrentUser();
    if (user) {
      try {
        const bestScore = await this.leaderboardService.getUserBestScore(
          user.id,
          'who-is-that-poke'
        );
        const rank = await this.leaderboardService.getUserRank(
          user.id,
          'who-is-that-poke'
        );
        this.userStats.set({ bestScore, rank });
      } catch (error) {
        console.error('Error loading stats:', error);
      }
    }
  }

  onScoreSubmitted() {
    console.log('Score submitted successfully');
    // La puntuación fue guardada exitosamente
    // Esperar un poco antes de permitir jugar de nuevo
  }

  resetGame() {
    this.isGameOver.set(false);
    this.finalScore.set(0);
    this.userStats.set(null);
    // Reiniciar el juego
  }
}
```

## Ejemplo 6: Observable pattern con RxJS

```typescript
import { Component, OnInit, inject } from '@angular/core';
import { LeaderboardService } from './services/leaderboard.service';
import { SupabaseService } from './services/supabase.service';
import { combineLatest, switchMap, startWith } from 'rxjs';

@Component({
  selector: 'app-user-leaderboard',
  template: `
    @let combined = (combined$ | async);
    @if (combined; as data) {
      <div>
        <h2>{{ data.user?.email }}</h2>
        
        <div class="user-scores">
          <h3>Tus Puntuaciones</h3>
          @for (entry of data.userEntries) {
            <div class="score-item">
              <p>{{ entry.score }} puntos</p>
              <p>{{ entry.created_at | date }}</p>
            </div>
          }
        </div>
        
        <div class="global-ranking">
          <h3>Ranking Global</h3>
          <p>Tu Posición: #{{ data.userRank }}</p>
          <p>Tu Mejor Score: {{ data.bestScore }}</p>
        </div>
      </div>
    }
  `
})
export class UserLeaderboardComponent implements OnInit {
  private supabaseService = inject(SupabaseService);
  private leaderboardService = inject(LeaderboardService);
  
  combined$!: Observable<any>;

  ngOnInit() {
    this.combined$ = this.supabaseService.getUser().pipe(
      switchMap((user) => {
        if (!user) {
          return of({ user: null, userEntries: [], userRank: 0, bestScore: 0 });
        }

        return combineLatest([
          of(user),
          this.leaderboardService.getUserLeaderboard(),
          this.leaderboardService.getUserRank(user.id),
          this.leaderboardService.getUserBestScore(user.id)
        ]).pipe(
          switchMap(([user, entries, rank, bestScore]) =>
            of({ user, userEntries: entries, userRank: rank, bestScore })
          )
        );
      }),
      startWith({ user: null, userEntries: [], userRank: 0, bestScore: 0 })
    );
  }
}
```

## Ejemplo 7: Error Handling completo

```typescript
import { Component, inject, signal } from '@angular/core';
import { LeaderboardService } from './services/leaderboard.service';
import { SupabaseService } from './services/supabase.service';

@Component({
  selector: 'app-game-with-error-handling',
  template: `
    @if (error()) {
      <div class="error-alert">
        <p>{{ error() }}</p>
        <button (click)="clearError()">Cerrar</button>
      </div>
    }

    @if (loading()) {
      <div class="spinner">Cargando...</div>
    }

    @if (success()) {
      <div class="success-alert">
        {{ success() }}
      </div>
    }

    <button (click)="saveScoreWithErrorHandling()">
      Guardar Puntuación
    </button>
  `
})
export class GameWithErrorHandlingComponent {
  private leaderboardService = inject(LeaderboardService);
  private supabaseService = inject(SupabaseService);
  
  error = signal('');
  loading = signal(false);
  success = signal('');

  async saveScoreWithErrorHandling() {
    try {
      this.error.set('');
      this.success.set('');
      this.loading.set(true);

      const user = this.supabaseService.getCurrentUser();
      
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      const result = await this.leaderboardService.saveGameResult(
        'MiNombre',
        {
          score: 1500,
          gameMode: 'who-is-that-poke'
        }
      );

      this.success.set('¡Puntuación guardada exitosamente!');
      
    } catch (err: any) {
      this.error.set(
        err.message || 'Error al guardar la puntuación. Intenta de nuevo.'
      );
    } finally {
      this.loading.set(false);
    }
  }

  clearError() {
    this.error.set('');
  }
}
```

---

## 🎯 Resumen de Ejemplos

| Ejemplo | Caso de Uso |
|---------|-----------|
| 1 | Autenticación básica |
| 2 | Guardar resultado de juego |
| 3 | Mostrar leaderboard global |
| 4 | Estadísticas del usuario |
| 5 | Integración completa |
| 6 | RxJS patterns avanzados |
| 7 | Error handling |

Todos estos ejemplos funcionan con los servicios que ya están implementados. ¡Adapta según tus necesidades!
