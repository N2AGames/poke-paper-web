import { Component, OnInit, Input, Output, EventEmitter, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../services/supabase.service';
import { LeaderboardService } from '../../services/leaderboard.service';
import { AuthModalComponent } from '../auth-modal/auth-modal.component';

@Component({
  selector: 'app-save-score',
  standalone: true,
  imports: [CommonModule, FormsModule, AuthModalComponent],
  templateUrl: './save-score.component.html',
  styleUrls: ['./save-score.component.css']
})
export class SaveScoreComponent implements OnInit {
  @Input() score: number = 0;
  @Output() scoreSubmitted = new EventEmitter<void>();

  private supabaseService = inject(SupabaseService);
  private leaderboardService = inject(LeaderboardService);

  currentUser = signal<any>(null);
  userName = signal('');
  tempUserName = signal('');
  isScoreSaved = signal(false);
  showError = signal(false);
  errorMessage = signal('');
  isSaving = signal(false);
  showAuthModal = signal(false);

  ngOnInit() {
    this.subscribeToUser();
  }

  private subscribeToUser() {
    this.supabaseService.getUser().subscribe(user => {
      this.currentUser.set(user);
      if (user) {
        this.userName.set(user.user_metadata?.username || user.email?.split('@')[0] || '');
        this.tempUserName.set(this.userName());
      }
    });
  }

  async saveScore() {
    try {
      this.showError.set(false);
      this.isSaving.set(true);
      const finalUserName = this.tempUserName() || this.userName() || 'Anonymous';

      await this.leaderboardService.saveGameResult(finalUserName, {
        score: this.score,
        gameMode: 'who-is-that-poke'
      });

      this.isScoreSaved.set(true);
      this.userName.set(finalUserName);
      this.scoreSubmitted.emit();
    } catch (error: any) {
      this.showError.set(true);
      this.errorMessage.set(error.message || 'Error al guardar la puntuación. Intenta de nuevo.');
      console.error('Error saving score:', error);
    } finally {
      this.isSaving.set(false);
    }
  }

  async logout() {
    try {
      this.showError.set(false);
      await this.supabaseService.signOut();
      this.isScoreSaved.set(false);
      this.tempUserName.set('');
    } catch (error: any) {
      this.showError.set(true);
      this.errorMessage.set('Error al cerrar sesión.');
      console.error('Error signing out:', error);
    }
  }

  onAuthSuccess(event: any) {
    console.log('Auth successful:', event);
    this.showAuthModal.set(false);
  }

  goToLeaderboard() {
    window.location.href = '/leaderboard';
  }
}
