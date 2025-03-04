import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LoginService } from '../services/login.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private loginService: LoginService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.loginService.getToken();  // Récupérer le token depuis le localStorage

    // Si la requête est l'authentification, ne pas ajouter le token
    if (req.url.includes('/api/auth/authenticate')) {
      return next.handle(req);  // Ne pas ajouter le token pour cette requête
    }

    if (token) {
      // Si un token existe, ajoute-le à l'en-tête Authorization
      const cloned = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
      return next.handle(cloned);
    }

    return next.handle(req);  // Si aucun token n'est trouvé, on passe la requête sans modification
  }
}
