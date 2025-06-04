// src/app/auth/auth.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service'; // Importer pour les notifications

export const authGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const notificationService = inject(NotificationService); // Injecter NotificationService

  if (authService.isAuthenticated()) {
    return true;
  } else {
    // Afficher une notification
    notificationService.showWarning('Vous devez être connecté pour accéder à cette page.');
    // Rediriger vers la page de login, en conservant l'URL de retour
    router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }
};