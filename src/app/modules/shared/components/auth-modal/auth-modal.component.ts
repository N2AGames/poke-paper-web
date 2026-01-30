import { Component, Output, EventEmitter, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-auth-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth-modal.component.html',
  styleUrls: ['./auth-modal.component.css']
})
export class AuthModalComponent {
  @Output() authSuccess = new EventEmitter<any>();
  @Output() close = new EventEmitter<void>();

  private supabaseService = inject(SupabaseService);

  isLogin = signal(true);
  isLoading = signal(false);
  email = '';
  username = '';
  password = '';
  confirmPassword = '';
  error = signal('');

  toggleMode() {
    this.isLogin.set(!this.isLogin());
    this.error.set('');
    this.clearForm();
  }

  closeModal() {
    this.close.emit();
  }

  private clearForm() {
    this.email = '';
    this.username = '';
    this.password = '';
    this.confirmPassword = '';
  }

  async onSubmit() {
    try {
      this.error.set('');
      this.isLoading.set(true);

      if (this.isLogin()) {
        await this.login();
      } else {
        await this.register();
      }
    } catch (err: any) {
      this.error.set(err.message || 'Error en autenticación');
    } finally {
      this.isLoading.set(false);
    }
  }

  private async login() {
    if (!this.email || !this.password) {
      throw new Error('Email y contraseña son requeridos');
    }

    const result = await this.supabaseService.signIn(this.email, this.password);
    this.authSuccess.emit(result);
    this.closeModal();
  }

  private async register() {
    if (!this.email || !this.password || !this.username) {
      throw new Error('Todos los campos son requeridos');
    }

    if (this.password.length < 6) {
      throw new Error('La contraseña debe tener mínimo 6 caracteres');
    }

    if (this.password !== this.confirmPassword) {
      throw new Error('Las contraseñas no coinciden');
    }

    const result = await this.supabaseService.signUp(
      this.email,
      this.password,
      this.username
    );
    this.authSuccess.emit(result);
    this.closeModal();
  }
}
