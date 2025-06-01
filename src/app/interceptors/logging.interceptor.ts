// src/app/interceptors/logging.interceptor.ts
import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

export const loggingInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {

  const startTime = Date.now();
  console.log(`%c[API Request] -> ${req.method} ${req.urlWithParams}`, 'color: blue; font-weight: bold;');

  // Si tu voulais ajouter un header à toutes les requêtes, tu le ferais ici :
  // const authReq = req.clone({ headers: req.headers.set('Authorization', 'Bearer MY_TOKEN') });
  // return next(authReq).pipe(...);

  return next(req).pipe(
    tap(event => {
      if (event instanceof HttpResponse) {
        const elapsedTime = Date.now() - startTime;
        console.log(
          `%c[API Response] <- ${event.status} ${event.statusText} | ${req.method} ${event.url} (${elapsedTime}ms)`,
          'color: green; font-weight: bold;',
          event.body // Logue le corps de la réponse
        );
      }
    }),
    catchError((error: HttpErrorResponse) => {
      const elapsedTime = Date.now() - startTime;
      console.error(
        `%c[API Error] <- ${error.status} ${error.statusText} | ${req.method} ${req.urlWithParams} (${elapsedTime}ms)`,
        'color: red; font-weight: bold;',
        error.error // Logue le corps de l'erreur
      );
      // Il est important de relancer l'erreur pour que les autres gestionnaires d'erreurs (services, composants) puissent la traiter
      throw error;
    })
  );
};