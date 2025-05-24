// auth.guard.ts
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
    // 1. Vérifier si l'utilisateur est connecté
    if (!this.loginService.isAuthenticated()) {
      this.router.navigate(['/securite'], { 
        queryParams: { returnUrl: state.url } // Garde en mémoire la page demandée
      });
      return false;
    }

    // 2. Vérifier les rôles si spécifiés dans la route
    const requiredRoles = route.data['roles'] as string[];
    if (requiredRoles) {
      const userRole = this.loginService.getRole();
      if (!requiredRoles.includes(userRole)) {
        this.router.navigate(['/auth/access']);
        return false;
      }
    }

    return true; // Tout est OK !
  }
}