import { Component, inject, signal } from '@angular/core';
import { form, required, minLength, FormField, FormRoot } from '@angular/forms/signals';
import { Router, RouterLink } from "@angular/router";
import { AuthService } from './auth-service';
import { HttpErrorResponse } from '@angular/common/http';
import { LoginErrorResponse } from './login-response.model';

interface LoginFormModel {
  username: string;
  password: string;
}

@Component({
  selector: 'app-connexion',
  imports: [RouterLink, FormField, FormRoot],
  templateUrl: './connexion.html',
  styleUrl: './connexion.css',
})
export class Connexion {

  authService = inject(AuthService);
  router = inject(Router);
  errorMessage = signal<string | null>(null);

  userType = signal<'doctor' | 'patient' | null>(null);

  readonly model = signal<LoginFormModel>({ username: '', password: '' });
  readonly form = form(this.model, (f) => {
    required(f.username, { message: "Le nom d'utilisateur est requis" });
    minLength(f.username, 3, { message: 'Minimum 3 caractères' });
    required(f.password, { message: 'Le mot de passe est requis' });
    minLength(f.password, 6, { message: 'Minimum 6 caractères' });
  });

  selectUserType(type: 'doctor' | 'patient'): void {
    this.userType.set(type);
  }

  handleSubmit() {
    const { username, password } = this.model();
    if (this.form().valid() && this.userType()) {
      this.handleLogin(username, password, true);
    }
  }

  handleLogin(username: string, password: string, remember_me: boolean = true) {
    this.errorMessage.set(null);

    this.authService.login(username, password, remember_me).subscribe({
      next: () => {
        const selectedRole = this.userType();
        if (selectedRole === 'patient') {
          void this.router.navigate(['/patients']);
        } else if (selectedRole === 'doctor') {
          void this.router.navigate(['/doctors']);
        } else {
          void this.router.navigate(['/intro']);
        }
      },
      error: (err: HttpErrorResponse) => {
        const backendError = err.error as LoginErrorResponse;
        console.error('Erreur de connexion', err);
        this.errorMessage.set(
          backendError?.message ?? 'Une erreur est survenue. Réessayez.'
        );
      }
    });
  }
}
