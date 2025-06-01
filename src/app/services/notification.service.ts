// src/app/services/notification.service.ts
import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { NotificationMessage } from '../models/notification-message'; // CHEMIN CORRECT SI models EST AU MÊME NIVEAU QUE services

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationSubject = new Subject<NotificationMessage | null>();
  public notificationState$: Observable<NotificationMessage | null> = this.notificationSubject.asObservable();

  constructor() { }

  public show(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info', duration: number = 5000): void {
    this.notificationSubject.next({ message, type });
    if (duration > 0) {
      setTimeout(() => {
        this.clear();
      }, duration);
    }
  }

  public showSuccess(message: string, duration: number = 3000): void {
    this.show(message, 'success', duration);
  }

  public showError(message: string, duration: number = 7000): void {
    this.show(message, 'error', duration);
  }

  public showInfo(message: string, duration: number = 3000): void {
    this.show(message, 'info', duration);
  }

  public showWarning(message: string, duration: number = 5000): void {
    this.show(message, 'warning', duration);
  }

  public clear(): void {
    this.notificationSubject.next(null);
  }
}