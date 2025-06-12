// src/app/auth/admin.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

export const adminGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): boolean => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const notificationService = inject(NotificationService);

  if (authService.isAuthenticated() && authService.isCurrentUserAdmin()) {
    return true; // Autorisé si authentifié ET admin
  }

  if (authService.isAuthenticated() && !authService.isCurrentUserAdmin()) {
    // Authentifié mais pas admin
    notificationService.showError("Accès refusé. Droits d'administrateur requis.");
    router.navigate(['/products']); // Rediriger vers une page sûre (ex: liste des produits)
    return false;
  }

  // Non authentifié (ce cas devrait être intercepté par authGuard avant si les deux sont appliqués)
  notificationService.showWarning('Vous devez être connecté et administrateur pour accéder à cette page.');
  router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
  return false;
};