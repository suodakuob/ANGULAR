// src/app/components/notification/notification.component.ts
import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { NotificationMessage } from '../../models/notification-message'; // CHEMIN CORRECT SI models EST UN FRÈRE DE components
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css']
})
export class NotificationComponent implements OnInit, OnDestroy {
  notification: NotificationMessage | null = null;
  private notificationSubscription!: Subscription;

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.notificationSubscription = this.notificationService.notificationState$.subscribe(
      (state) => {
        this.notification = state;
      }
    );
  }

  ngOnDestroy(): void {
    if (this.notificationSubscription) {
      this.notificationSubscription.unsubscribe();
    }
  }

  getAlertClass(type: 'success' | 'error' | 'info' | 'warning' | undefined): string {
    if (!type) return 'alert-info';
    if (type === 'error') return 'alert-danger';
    if (type === 'warning') return 'alert-warning';
    if (type === 'success') return 'alert-success';
    return `alert-${type}`;
  }

  closeNotification(): void {
    this.notificationService.clear();
  }
}