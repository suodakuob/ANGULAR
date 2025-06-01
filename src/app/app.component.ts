// src/app/app.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
// Importe RouterOutlet, RouterLink, et RouterLinkActive
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { NotificationComponent } from './components/notification/notification.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,         // <--- AJOUTER CET IMPORT
    RouterLinkActive,   // <--- AJOUTER CET IMPORT
    NotificationComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'product-manager'; // Tu peux remettre cette ligne si tu le souhaites
}