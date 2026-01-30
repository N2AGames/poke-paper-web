import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../shared/services/supabase.service';
import { LeaderboardService } from '../shared/services/leaderboard.service';
import { LeaderboardEntry } from '../shared/models/leaderboard.model';
import { AuthModalComponent } from '../shared/components/auth-modal/auth-modal.component';

@Component({
  selector: 'app-leaderboard',
  standalone: true,
  imports: [CommonModule, FormsModule, AuthModalComponent],
  templateUrl: './leaderboard.component.html',
  styleUrls: ['./leaderboard.component.css']
})
export class LeaderboardComponent implements OnInit {
  private supabaseService = inject(SupabaseService);
  private leaderboardService = inject(LeaderboardService);

  leaderboardEntries = signal<LeaderboardEntry[]>([]);
  currentUser = signal<any>(null);
  isLoading = signal(true);
  selectedGameMode = signal('all');
  gameUsername = signal('');
  showAuthModal = signal(false);

  gameModes = ['all', 'who-is-that-poke'];

  ngOnInit() {
    this.loadLeaderboard();
    this.subscribeToUser();
  }

  private subscribeToUser() {
    this.supabaseService.getUser().subscribe(user => {
      this.currentUser.set(user);
      if (user) {
        this.gameUsername.set(user.user_metadata?.username || user.email?.split('@')[0] || '');
      }
    });
  }

  private async loadLeaderboard() {
    this.isLoading.set(true);
    try {
      const gameMode = this.selectedGameMode() === 'all' ? undefined : this.selectedGameMode();
      await this.leaderboardService.getLeaderboard(100, gameMode);
      this.leaderboardService.leaderboard$.subscribe(entries => {
        this.leaderboardEntries.set(entries);
      });
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  onGameModeChange() {
    this.loadLeaderboard();
  }

  openAuthModal() {
    this.showAuthModal.set(true);
  }

  async logout() {
    try {
      await this.supabaseService.signOut();
      this.gameUsername.set('');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }

  onAuthSuccess(event: any) {
    console.log('Auth successful:', event);
    this.showAuthModal.set(false);
  }

  getRankBadge(index: number): string {
    switch (index) {
      case 0:
        return '🥇';
      case 1:
        return '🥈';
      case 2:
        return '🥉';
      default:
        return '';
    }
  }

  getRowClass(index: number): string {
    if (index === 0) return 'rank-gold';
    if (index === 1) return 'rank-silver';
    if (index === 2) return 'rank-bronze';
    return '';
  }
}
