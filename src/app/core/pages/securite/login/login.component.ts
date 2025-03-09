import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from 'src/app/core/services/login.service';
import { UserService } from 'src/app/core/services/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html'
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  errorMessage: string = '';
  isFormInvalid: boolean = false;
  isEmailInvalid: boolean = false;

  constructor(private loginService: LoginService,private userService: UserService, private router: Router) { }

  onLogin(): void {
    this.isFormInvalid = false;
    this.isEmailInvalid = false;
  
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
        // On suppose que la réponse contient le token et l'ID utilisateur
        console.log('Utilisateur connecté:', response);
        console.log('User ID:', response.id);
  
        // Stocker le token et l'ID utilisateur dans le localStorage
        this.loginService.setAuthData(response.token, response.id.toString());  // Convertir l'id en string
  
        // Récupérer l'ID de l'utilisateur depuis le localStorage
        const userId = this.loginService.getUserId();
        
        if (userId) {
          // Convertir l'ID utilisateur en number
          const userIdNumber = Number(userId);
  
          if (!isNaN(userIdNumber)) {
            this.userService.getUserById(userIdNumber).subscribe({
              next: (userData) => {
                const isFirstLogin = userData.firstLogin;
                console.log("First login:", isFirstLogin);
  
                // Rediriger l'utilisateur en fonction du premier login
                if (isFirstLogin) {
                  this.router.navigate(['/securite/acces']); // Rediriger vers la page de changement de mot de passe
                } else {
                  this.router.navigate(['/']); // Rediriger vers la page d'accueil
                }
              },
              error: () => {
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
      error: () => {
        this.errorMessage = 'Échec de la connexion. Vérifiez vos identifiants.';
      }
    });
  }}