import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { LoginService } from 'src/app/core/services/login.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  
  constructor(
    private loginService: LoginService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    if (this.loginService.isAuthenticated()) {
      return true; // Utilisateur connecté, accès autorisé
    } else {
      // Utilisateur non connecté, redirection vers la page de login
      this.router.navigate(['/securite']);
      return false; // Accès refusé
    }
  }
}