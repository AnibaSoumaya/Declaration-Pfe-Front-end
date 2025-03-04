import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from 'src/app/core/services/login.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html'
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  errorMessage: string = '';
  isFormInvalid: boolean = false; // Variable pour gérer la validation du formulaire
  isEmailInvalid: boolean = false; // Variable pour gérer la validation de l'email

  constructor(private loginService: LoginService, private router: Router) { }

  onLogin(): void {
    // Réinitialiser les messages d'erreur à chaque soumission
    this.isFormInvalid = false;
    this.isEmailInvalid = false;
  
    // Vérifier si l'email et le mot de passe sont remplis
    if (!this.email || !this.password) {
      this.isFormInvalid = true;
      this.errorMessage = 'Veuillez remplir tous les champs pour vous connecter.';
      return;
    }
  
    // Vérifier le format de l'email
    if (!this.email.includes('@')) {
      this.isEmailInvalid = true;
      this.errorMessage = 'L\'adresse email doit être valide (ex: user@example.com).';
      return;
    }
  
    // Si tout est valide, envoyer la demande de connexion
    this.loginService.login(this.email, this.password).subscribe({
      next: (user) => {
        // Afficher toutes les données de l'utilisateur dans la console
        console.log('Utilisateur connecté:', user);  // Affiche l'objet 'user' dans la console
  
        // Sauvegarder le token dans le localStorage
        this.loginService.setToken(user.token);
  
        // Rediriger vers la page d'accueil ou la page protégée
        this.router.navigate(['/']);
      },
      error: (error) => {
        this.errorMessage = 'Échec de la connexion. Vérifiez vos identifiants.';
      }
    });
  }
  
}
