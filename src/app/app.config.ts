// src/app/app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
// Importe withInterceptors de @angular/common/http
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { loggingInterceptor } from './interceptors/logging.interceptor'; // <--- IMPORTE TON INTERCEPTEUR

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([loggingInterceptor]) // <--- AJOUTE L'INTERCEPTEUR ICI
    )
  ]
};