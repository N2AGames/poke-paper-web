import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { SupabaseService } from './supabase.service';
import { LeaderboardEntry, GameResult } from '../models/leaderboard.model';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LeaderboardService {
  private supabaseService = inject(SupabaseService);
  private platformId = inject(PLATFORM_ID);
  private leaderboardSubject = new BehaviorSubject<LeaderboardEntry[]>([]);
  public leaderboard$ = this.leaderboardSubject.asObservable();

  constructor() {}

  /**
   * Obtener el leaderboard global ordenado por puntuación
   */
  async getLeaderboard(limit: number = 100, gameMode?: string): Promise<LeaderboardEntry[]> {
    try {
      const supabase = this.supabaseService.getClient();
      
      // Si no hay cliente Supabase (ej: SSR), retornar array vacío
      if (!supabase) {
        console.warn('Supabase client not initialized');
        return [];
      }

      let query = supabase.from('leaderboard').select('*').order('score', { ascending: false });

      if (gameMode) {
        query = query.eq('game_mode', gameMode);
      }

      const { data, error } = await query.limit(limit);

      if (error) {
        console.error('Error fetching leaderboard:', error);
        throw error;
      }

      this.leaderboardSubject.next(data || []);
      return data || [];
    } catch (error) {
      console.error('Error in getLeaderboard:', error);
      throw error;
    }
  }

  /**
   * Obtener el leaderboard personal del usuario
   */
  async getUserLeaderboard(): Promise<LeaderboardEntry[]> {
    try {
      const user = this.supabaseService.getCurrentUser();
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      const supabase = this.supabaseService.getClient();
      if (!supabase) {
        console.warn('Supabase client not initialized');
        return [];
      }

      const { data, error } = await supabase
        .from('leaderboard')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getUserLeaderboard:', error);
      throw error;
    }
  }

  /**
   * Guardar resultado del juego en el leaderboard
   */
  async saveGameResult(username: string, gameResult: GameResult): Promise<LeaderboardEntry> {
    try {
      const user = this.supabaseService.getCurrentUser();
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      const supabase = this.supabaseService.getClient();
      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }

      const newEntry: any = {
        user_id: user.id,
        username: username,
        email: user.email,
        score: gameResult.score,
        game_mode: gameResult.gameMode,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('leaderboard')
        .insert([newEntry])
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in saveGameResult:', error);
      throw error;
    }
  }

  /**
   * Actualizar puntuación del usuario
   */
  async updateScore(entryId: string, newScore: number): Promise<LeaderboardEntry> {
    try {
      const supabase = this.supabaseService.getClient();
      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }

      const { data, error } = await supabase
        .from('leaderboard')
        .update({
          score: newScore,
          updated_at: new Date().toISOString()
        })
        .eq('id', entryId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in updateScore:', error);
      throw error;
    }
  }

  /**
   * Obtener ranking del usuario (posición en el leaderboard)
   */
  async getUserRank(userId: string, gameMode?: string): Promise<number> {
    try {
      const supabase = this.supabaseService.getClient();
      if (!supabase) {
        console.warn('Supabase client not initialized');
        return 0;
      }

      let query = supabase.from('leaderboard').select('user_id').order('score', { ascending: false });

      if (gameMode) {
        query = query.eq('game_mode', gameMode);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      const userRank = data?.findIndex((entry: any) => entry.user_id === userId) + 1;
      return userRank || 0;
    } catch (error) {
      console.error('Error in getUserRank:', error);
      throw error;
    }
  }

  /**
   * Obtener el mejor puntaje del usuario
   */
  async getUserBestScore(userId: string, gameMode?: string): Promise<number> {
    try {
      const supabase = this.supabaseService.getClient();
      if (!supabase) {
        console.warn('Supabase client not initialized');
        return 0;
      }

      let query = supabase.from('leaderboard').select('score').eq('user_id', userId).order('score', { ascending: false });

      if (gameMode) {
        query = query.eq('game_mode', gameMode);
      }

      const { data, error } = await query.limit(1).single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data?.score || 0;
    } catch (error) {
      console.error('Error in getUserBestScore:', error);
      return 0;
    }
  }
}
