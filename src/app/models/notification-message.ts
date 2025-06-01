// src/app/models/notification-message.ts
export interface NotificationMessage {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}