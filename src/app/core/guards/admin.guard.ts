// src/app/core/guards/admin.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { LoginService } from '../services/login.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {

  constructor(private loginService: LoginService, private router: Router) {}

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const token = this.loginService.getToken();

    if (token) {
      const user = this.loginService.decodeToken(token);
      if (user.role === 'administrateur') {
        return true;  // L'utilisateur est administrateur, accès autorisé
      } else {
        this.router.navigate(['/unauthorized']);  // Redirige vers une page d'erreur ou non autorisé
        return false;
      }
    }

    this.router.navigate(['/login']);  // Si pas de token, redirige vers la page de connexion
    return false;
  }
}
