import { NgModule } from '@angular/core';
import { LeaderboardComponent } from './leaderboard.component';
import { LEADERBOARD_ROUTES } from './leaderboard.routing';

@NgModule({
  imports: [LeaderboardComponent],
  providers: []
})
export class LeaderboardModule {}

// Exportar rutas para lazy loading
export { LEADERBOARD_ROUTES };
