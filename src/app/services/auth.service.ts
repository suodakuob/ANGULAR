// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { tap, delay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private loggedIn = new BehaviorSubject<boolean>(this.hasToken());
  // private currentUserRole = new BehaviorSubject<string | null>(this.getRoleFromToken()); // Optionnel pour les rôles

  isLoggedIn$: Observable<boolean> = this.loggedIn.asObservable();
  // userRole$: Observable<string | null> = this.currentUserRole.asObservable(); // Optionnel

  constructor(private router: Router) { }

  private hasToken(): boolean {
    return !!localStorage.getItem('fakeToken');
  }

  // Simuler des identifiants valides
  private validCredentials = { email: 'test@example.com', password: 'password' };

  login(credentials: { email: string, password: string }): Observable<boolean> {
    if (credentials.email === this.validCredentials.email && credentials.password === this.validCredentials.password) {
      return of(true).pipe(
        delay(1000), // Simule la latence réseau
        tap(() => {
          localStorage.setItem('fakeToken', 'my-super-secret-fake-token');
          this.loggedIn.next(true);
          console.log('AuthService: Login successful');
        })
      );
    }
    console.log('AuthService: Login failed - invalid credentials');
    // Retourne un Observable qui émet une erreur après un court délai
    return throwError(() => new Error('Identifiants incorrects')).pipe(delay(500));
  }

  logout(): void {
    localStorage.removeItem('fakeToken');
    this.loggedIn.next(false);
    this.router.navigate(['/login']);
    console.log('AuthService: Logout successful');
  }

  isAuthenticated(): boolean {
    return this.loggedIn.value;
  }
}