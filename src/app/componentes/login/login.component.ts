import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

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

  constructor(private router: Router) {}

  login(): void {
    if (this.username.trim() === 'admin' && this.password === 'admin') {
      this.errorMessage = '';
      this.router.navigate(['/principal']);
      return;
    }

    this.errorMessage = 'Usuario o contraseña incorrectos.';
  }
}
