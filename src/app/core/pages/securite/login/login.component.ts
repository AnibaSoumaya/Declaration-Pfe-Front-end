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

  // Variables pour la dialog de récupération de mot de passe
  forgotPasswordDialogVisible: boolean = false;
  resetEmail: string = '';
  resetEmailError: string = '';
  resetSuccessMessage: string = '';
  isResetLoading: boolean = false;

  constructor(
    private loginService: LoginService,
    private userService: UserService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Si l'utilisateur est déjà connecté, le rediriger vers la page d'accueil
    if (this.loginService.isAuthenticated()) {
      this.router.navigate(['/profil']);
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
      this.loginService.setAuthData(
        response.token,
        response.id.toString(),
        response.firstname,
        response.lastname,
      );

      // Récupération des données complètes de l'utilisateur
      this.userService.getCurrentUser().subscribe({
        next: (userData) => {
           console.log('User data:', userData); // <-- Ajoutez ce log
          console.log('First login:', userData.firstLogin); 
          console.log('User role:', userData.role);
          
          // Redirection basée sur le rôle ET firstLogin
          if (userData.firstLogin) {
            this.router.navigate(['/securite/acces']);
          } else {
            this.redirectByRole(userData.role);
          }
        },
        error: (error) => {
          console.error('Erreur récupération utilisateur:', error);
          this.errorMessage = 'Erreur lors de la récupération du profil.';
        }
      });
    },
    error: (error) => {
      console.error('Échec connexion:', error);
      this.errorMessage = 'Échec de la connexion. Vérifiez vos identifiants.';
    }
  });
}

// Nouvelle méthode pour gérer la redirection par rôle
private redirectByRole(role: string): void {
  const routes: {[key: string]: string} = {
    'administrateur': '/Assujetti/statistiqueA',
    'conseiller_rapporteur': '/Assujetti/statistiqueCR',
    'procureur_general': '/Assujetti/statistiquePG',
    'avocat_general': '/Assujetti/statistiqueAG'
  };

  const defaultRoute = '/profil';
  this.router.navigate([routes[role] || defaultRoute]);
}

  // Ouvrir la dialog de récupération de mot de passe
  openForgotPasswordDialog(): void {
    this.forgotPasswordDialogVisible = true;
    this.resetEmail = '';
    this.resetEmailError = '';
    this.resetSuccessMessage = '';
  }

  // Fermer la dialog de récupération de mot de passe
  closeForgotPasswordDialog(): void {
    this.forgotPasswordDialogVisible = false;
    this.resetEmail = '';
    this.resetEmailError = '';
    this.resetSuccessMessage = '';
    this.isResetLoading = false;
  }

  // Valider l'email pour la récupération
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Envoyer la demande de récupération de mot de passe
  onSendResetEmail(): void {
    this.resetEmailError = '';
    this.resetSuccessMessage = '';

    // Validation de l'email
    if (!this.resetEmail) {
      this.resetEmailError = 'Veuillez saisir une adresse email.';
      return;
    }

    if (!this.isValidEmail(this.resetEmail)) {
      this.resetEmailError = 'Veuillez saisir une adresse email valide.';
      return;
    }

    this.isResetLoading = true;

    // Vérifier d'abord si l'email existe
    this.loginService.checkEmailExists(this.resetEmail).subscribe({
      next: (emailExists) => {
        if (!emailExists) {
          this.resetEmailError = 'Aucun compte n\'est associé à cette adresse email.';
          this.isResetLoading = false;
          return;
        }

        // Si l'email existe, envoyer la demande de reset
        this.loginService.resetPassword(this.resetEmail).subscribe({
          next: (response) => {
            this.resetSuccessMessage = 'Un email de récupération a été envoyé à votre adresse. Veuillez vérifier votre boîte de réception.';
            this.isResetLoading = false;
            
            // Fermer la dialog après 3 secondes
            setTimeout(() => {
              this.closeForgotPasswordDialog();
            }, 3000);
          },
          error: (error) => {
            console.error('Erreur lors de l\'envoi du reset:', error);
            this.resetEmailError = 'Une erreur est survenue lors de l\'envoi de l\'email de récupération. Veuillez réessayer plus tard.';
            this.isResetLoading = false;
          }
        });
      },
      error: (error) => {
        console.error('Erreur lors de la vérification de l\'email:', error);
        this.resetEmailError = 'Une erreur est survenue lors de la vérification de l\'email. Veuillez réessayer plus tard.';
        this.isResetLoading = false;
      }
    });
  }
}