import { Routes } from '@angular/router';
import { LoginComponent } from './componentes/login/login.component';
import { PrincipalComponent } from './componentes/principal/principal.component'; 
import { DashboardComponent } from './componentes/dashboard/dashboard.component';
import { OrdenComponent } from './componentes/orden/orden.component';
import { EstadoComponent } from './componentes/estado/estado.component';


export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  {    path: 'principal', component: PrincipalComponent,
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },

  { path: '**', redirectTo: 'login' }
  
];

