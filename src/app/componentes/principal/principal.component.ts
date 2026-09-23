import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-principal',
  standalone: true, // Si usas componentes standalone en Angular 17+
  imports: [
    CommonModule,        // Permite usar *ngIf en tu HTML
    RouterOutlet,        // Reconoce la etiqueta <router-outlet>
    RouterLink,          // Reconoce las directivas routerLink
    RouterLinkActive     // Reconoce routerLinkActive
  ],
  templateUrl: './principal.component.html',
  styleUrls: ['./principal.component.css']
})
export class PrincipalComponent {
  
  // Estado para colapsar u ocultar el menú lateral
  menuOculto: boolean = false;

  toggleMenu(): void {
    this.menuOculto = !this.menuOculto;
  }
}