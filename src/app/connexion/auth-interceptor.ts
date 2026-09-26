import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth-service';

/**
 * Ajoute automatiquement `Authorization: Bearer <token>` à chaque requête HTTP
 * sortante lorsqu'un utilisateur est connecté. Si le backend répond 401
 * (token expiré/invalide), on déconnecte l'utilisateur et on le renvoie
 * vers la page de connexion.
 *
 * À enregistrer dans app.config.ts :
 *   provideHttpClient(withInterceptors([authInterceptor]))
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const token = authService.token();

  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  // La requête de déconnexion elle-même passe aussi par cet intercepteur : si elle
  // échoue en 401 (token déjà invalide), il ne faut pas rappeler logout() dessus,
  // sous peine de boucle infinie (logout -> 401 -> logout -> 401 -> ...).
  const isLogoutRequest = req.url.endsWith('user/logout');

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !isLogoutRequest) {
        // logout() renvoie un Observable "cold" : sans souscription, la requête de
        // déconnexion ne part jamais et la session locale n'est jamais effacée.
        authService.logout().subscribe(() => {
          void router.navigate(['/connexion']);
        });
      }
      return throwError(() => error);
    })
  );
};