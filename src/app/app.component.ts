// src/app/app.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, RouterModule } from '@angular/router';
import { NotificationComponent } from './components/notification/notification.component';
import { AuthService } from './services/auth.service';
import { CartService } from './services/cart.service';
import { Observable } from 'rxjs';
// map n'est plus directement nécessaire ici si on utilise authService.isAdmin$

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterModule,
    NotificationComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  isLoggedIn$!: Observable<boolean>;
  isAdmin$!: Observable<boolean>; // Pour le rôle admin
  currentYear: number = new Date().getFullYear();
  cartItemCount$!: Observable<number>;

  constructor(
    public authService: AuthService, // public pour accès template direct
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit() {
    this.isLoggedIn$ = this.authService.isLoggedIn$;
    this.isAdmin$ = this.authService.isAdmin$; // Utiliser l'Observable directement
    this.cartItemCount$ = this.cartService.cartItemCount$;

    // Enregistrer l'action de vider le panier pour le logout
    this.authService.registerLogoutAction(() => {
        this.cartService.clearCart();
    });
  }

  logout(): void {
    this.authService.logout();
    // Les actions de logout, y compris vider le panier, sont maintenant gérées dans AuthService
  }
}