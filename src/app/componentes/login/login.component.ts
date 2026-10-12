import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  username = '';
  password = '';
  errorMessage = '';
  systemName = 'TecFix S.A.';
  isLoading = false;

  constructor(
    private readonly router: Router,
    private readonly authService: AuthService
  ) {}

  login(): void {
    const username = this.username.trim();
    if (!username || !this.password) {
      this.errorMessage = 'Ingrese su usuario y contraseña.';
      return;
    }

    this.errorMessage = '';
    this.isLoading = true;

    this.authService.login({ username, password: this.password }).subscribe({
      next: () => {
        this.isLoading = false;
        void this.router.navigate(['/principal']);
      },
      error: (error: unknown) => {
        this.isLoading = false;
        this.errorMessage = this.getLoginErrorMessage(error);
      }
    });
  }

  private getLoginErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 0) {
        return 'No se pudo conectar con el servicio de inicio de sesión. Verifique la conexión y la configuración CORS de la API.';
      }

      if (error.status === 401) {
        return 'Usuario o contraseña incorrectos.';
      }

      if (error.status === 400) {
        return 'La solicitud de inicio de sesión no es válida.';
      }
    }

    return 'No fue posible iniciar sesión. Inténtelo nuevamente más tarde.';
  }
}
