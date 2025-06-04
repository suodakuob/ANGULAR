// src/app/app.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, RouterModule } from '@angular/router'; // RouterModule pour routerLink
import { NotificationComponent } from './components/notification/notification.component'; // S'assurer qu'il est importé
import { AuthService } from './services/auth.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterModule, // Important pour [routerLink] et routerLinkActive
    NotificationComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  isLoggedIn$!: Observable<boolean>;

  // Injection directe dans le constructeur rend authService disponible dans le template si public
  constructor(public authService: AuthService, private router: Router) {}

  ngOnInit() {
    this.isLoggedIn$ = this.authService.isLoggedIn$;
  }

  logout(): void {
    this.authService.logout();
    // La redirection est gérée dans authService.logout()
  }
}