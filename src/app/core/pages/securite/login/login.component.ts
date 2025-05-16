import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from 'src/app/core/services/login.service';
import { UserService } from 'src/app/core/services/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit {
  email: string = '';
  password: string = '';
  errorMessage: string = '';
  isFormInvalid: boolean = false;
  isEmailInvalid: boolean = false;
  
  constructor(
    private loginService: LoginService,
    private userService: UserService, 
    private router: Router
  ) { }
  
  ngOnInit(): void {
    // Si l'utilisateur est déjà connecté, le rediriger vers la page d'accueil
    if (this.loginService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  onLogin(): void {
    this.isFormInvalid = false;
    this.isEmailInvalid = false;
    this.errorMessage = '';
 
    if (!this.email || !this.password) {
      this.isFormInvalid = true;
      this.errorMessage = 'Veuillez remplir tous les champs pour vous connecter.';
      return;
    }
 
    if (!this.email.includes('@')) {
      this.isEmailInvalid = true;
      this.errorMessage = 'L\'adresse email doit être valide (ex: user@example.com).';
      return;
    }
 
    this.loginService.login(this.email, this.password).subscribe({
      next: (response) => {
        console.log('Utilisateur connecté:', response);
 
        // Stocker le token, l'ID, le prénom et le nom de l'utilisateur
        this.loginService.setAuthData(
          response.token,
          response.id.toString(),
          response.firstname,
          response.lastname,
        );
 
        // Récupérer l'ID de l'utilisateur depuis le localStorage
        const userId = this.loginService.getUserId();
 
        if (userId) {
          const userIdNumber = Number(userId);
 
          if (!isNaN(userIdNumber)) {
            this.userService.getUserById(userIdNumber).subscribe({
              next: (userData) => {
                const isFirstLogin = userData.firstLogin;
                console.log("First login:", isFirstLogin);
 
                // Redirection selon le cas
                if (isFirstLogin) {
                  this.router.navigate(['/securite/acces']);
                } else {
                  this.router.navigate(['/dashboard']);
                }
              },
              error: (error) => {
                console.error('Erreur lors de la récupération des informations utilisateur:', error);
                this.errorMessage = 'Erreur lors de la récupération des informations utilisateur.';
              }
            });
          } else {
            this.errorMessage = 'ID utilisateur invalide.';
          }
        } else {
          this.errorMessage = 'ID utilisateur introuvable.';
        }
      },
      error: (error) => {
        console.error('Échec de la connexion:', error);
        this.errorMessage = 'Échec de la connexion. Vérifiez vos identifiants.';
      }
    });
  }
}