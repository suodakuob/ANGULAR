// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { tap, delay, map } from 'rxjs/operators';

export type UserRole = 'admin' | 'customer' | null; // Types de rôles possibles

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private loggedIn = new BehaviorSubject<boolean>(this.hasToken());
  private currentUserRole = new BehaviorSubject<UserRole>(this.getRoleFromStorage());

  isLoggedIn$: Observable<boolean> = this.loggedIn.asObservable();
  userRole$: Observable<UserRole> = this.currentUserRole.asObservable();
  isAdmin$: Observable<boolean> = this.userRole$.pipe(map(role => role === 'admin'));

  // Pour éviter les dépendances circulaires directes avec CartService
  // AppComponent injectera CartService et l'appellera au logout.
  private onLogoutActions: (() => void)[] = [];


  constructor(private router: Router) { }

  registerLogoutAction(action: () => void): void {
    this.onLogoutActions.push(action);
  }

  private hasToken(): boolean {
    return !!localStorage.getItem('fakeToken');
  }

  private getRoleFromStorage(): UserRole {
    const role = localStorage.getItem('userRole');
    if (role === 'admin' || role === 'customer') {
      return role;
    }
    return null;
  }

  // Simuler des identifiants valides
  private readonly validUsers = {
    'admin@example.com': { password: 'password', role: 'admin' as UserRole },
    'user@example.com': { password: 'password', role: 'customer' as UserRole }
  };

  login(credentials: { email: string, password: string }): Observable<{success: boolean, role: UserRole}> {
    const userDetails = this.validUsers[credentials.email as keyof typeof this.validUsers];

    if (userDetails && userDetails.password === credentials.password) {
      const role = userDetails.role;
      return of({success: true, role: role}).pipe(
        delay(500), // Simule la latence réseau
        tap(() => {
          localStorage.setItem('fakeToken', `fake-token-for-${role}-${new Date().getTime()}`);
          localStorage.setItem('userRole', role as string);
          this.loggedIn.next(true);
          this.currentUserRole.next(role);
          console.log(`AuthService: Login successful as ${role}`);
        })
      );
    }
    console.log('AuthService: Login failed - invalid credentials');
    return throwError(() => new Error('Identifiants incorrects')).pipe(delay(500));
  }

  logout(): void {
    localStorage.removeItem('fakeToken');
    localStorage.removeItem('userRole');
    this.loggedIn.next(false);
    this.currentUserRole.next(null);

    // Exécuter les actions de nettoyage enregistrées (comme vider le panier)
    this.onLogoutActions.forEach(action => action());

    this.router.navigate(['/login']);
    console.log('AuthService: Logout successful');
  }

  isAuthenticated(): boolean {
    return this.loggedIn.value;
  }

  getCurrentUserRole(): UserRole {
    return this.currentUserRole.value;
  }

  // Helper direct pour les gardes ou les composants si un Observable n'est pas nécessaire
  isCurrentUserAdmin(): boolean {
    return this.isAuthenticated() && this.getCurrentUserRole() === 'admin';
  }
}