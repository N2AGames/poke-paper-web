import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { createClient, SupabaseClient, AuthSession } from '@supabase/supabase-js';
import { BehaviorSubject, Observable } from 'rxjs';
import { SUPABASE_CONFIG } from '../config/supabase.config';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase!: SupabaseClient;
  private userSubject = new BehaviorSubject<any>(null);
  public user$ = this.userSubject.asObservable();
  private platformId = inject(PLATFORM_ID);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.supabase = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.key);
      this.initializeAuth();
    }
  }

  private async initializeAuth() {
    try {
      const { data: { session } } = await this.supabase.auth.getSession();
      this.userSubject.next(session?.user || null);

      // Escuchar cambios de autenticación
      this.supabase.auth.onAuthStateChange((event, session) => {
        this.userSubject.next(session?.user || null);
      });
    } catch (error) {
      console.error('Error initializing auth:', error);
    }
  }

  getClient(): SupabaseClient {
    return this.supabase;
  }

  getUser(): Observable<any> {
    return this.user$;
  }

  getCurrentUser() {
    return this.userSubject.value;
  }

  /**
   * Registrar un nuevo usuario con email y contraseña
   */
  async signUp(email: string, password: string, username: string) {
    try {
      const { data, error } = await this.supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username
          }
        }
      });

      if (error) {
        console.error('Error signing up:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in signUp:', error);
      throw error;
    }
  }

  /**
   * Iniciar sesión con email y contraseña
   */
  async signIn(email: string, password: string) {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('Error signing in:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in signIn:', error);
      throw error;
    }
  }

  async signOut() {
    try {
      const { error } = await this.supabase.auth.signOut();
      if (error) {
        throw error;
      }
      this.userSubject.next(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  }

  async getCurrentSession(): Promise<AuthSession | null> {
    const { data: { session } } = await this.supabase.auth.getSession();
    return session;
  }
}
