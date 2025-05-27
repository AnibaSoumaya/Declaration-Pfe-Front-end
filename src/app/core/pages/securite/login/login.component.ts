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