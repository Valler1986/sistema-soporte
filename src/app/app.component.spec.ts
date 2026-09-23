/// <reference types="jasmine" />

import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { routes } from './app.routes';
import { OrdenComponent } from './componentes/orden/orden.component';
import { EstadoComponent } from './componentes/estado/estado.component';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should include order and status routes in principal', () => {
    const principalRoute = routes.find((route) => route.path === 'principal');

    expect(principalRoute).toBeTruthy();
    expect(principalRoute?.children).toContain(jasmine.objectContaining({
      path: 'orden',
      component: OrdenComponent,
    }));
    expect(principalRoute?.children).toContain(jasmine.objectContaining({
      path: 'estado',
      component: EstadoComponent,
    }));
  });
});
