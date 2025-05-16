import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from 'src/app/core/services/user.service';
import { User } from 'src/app/core/models/User.model';

@Component({
    selector: 'app-access',
    templateUrl: './access.component.html',
})
export class AccessComponent implements OnInit {
    value8: any;

    // Champs de formulaire
    email: string = '';
    newPassword: string = '';
    confirmPassword: string = '';
    
    // Messages d'erreur
    emailError: string = '';
    passwordError: string = '';
    confirmPasswordError: string = '';
    
    // Stockage de l'utilisateur actuel
    currentUser: User | null = null;

    constructor(private userService: UserService, private router: Router) {}
    
    ngOnInit() {
        // Récupérer l'utilisateur courant au chargement du composant
        this.loadCurrentUser();
    }
    
    loadCurrentUser() {
        this.userService.getCurrentUser().subscribe({
            next: (user) => {
                this.currentUser = user;
                console.log('Utilisateur courant chargé:', user);
            },
            error: (err) => {
                console.error('Erreur lors du chargement de l\'utilisateur courant:', err);
            }
        });
    }
    
    // Validation des champs avant soumission
    validateAndChangePassword() {
        // Réinitialiser les messages d'erreur
        this.resetErrors();
        
        // Vérifier si l'email correspond à celui de l'utilisateur actuel
        if (!this.validateEmail()) {
            return;
        }
        
        // Vérifier si les deux mots de passe correspondent
        if (!this.validatePasswords()) {
            return;
        }
        
        // Si toutes les validations sont passées, procéder au changement de mot de passe
        this.changePassword();
    }
    
    validateEmail(): boolean {
        if (!this.email) {
            this.emailError = 'Veuillez saisir votre adresse email';
            return false;
        }
        
        // Vérifier si l'email est valide (format)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(this.email)) {
            this.emailError = 'Veuillez saisir une adresse email valide';
            return false;
        }
        
        // Vérifier si l'email correspond à celui de l'utilisateur actuel
        if (this.currentUser && this.email !== this.currentUser.email) {
            this.emailError = 'Cette adresse email ne correspond pas à votre compte';
            return false;
        }
        
        return true;
    }
    
    validatePasswords(): boolean {
        // Vérifier si le mot de passe est saisi
        if (!this.newPassword) {
            this.passwordError = 'Veuillez saisir un nouveau mot de passe';
            return false;
        }
        
        // Vérifier la longueur minimale du mot de passe
        if (this.newPassword.length < 8) {
            this.passwordError = 'Le mot de passe doit contenir au moins 8 caractères';
            return false;
        }
        
        // Vérifier si le mot de passe de confirmation est saisi
        if (!this.confirmPassword) {
            this.confirmPasswordError = 'Veuillez confirmer votre mot de passe';
            return false;
        }
        
        // Vérifier si les deux mots de passe correspondent
        if (this.newPassword !== this.confirmPassword) {
            this.confirmPasswordError = 'Les mots de passe ne correspondent pas';
            return false;
        }
        
        return true;
    }
    
    resetErrors() {
        this.emailError = '';
        this.passwordError = '';
        this.confirmPasswordError = '';
    }
    
    // Vérifier si le formulaire est valide pour activer/désactiver le bouton
    isFormInvalid(): boolean {
        return !this.email || !this.newPassword || !this.confirmPassword;
    }

    changePassword() {
        console.log('Tentative de changement de mot de passe...');
        this.userService.changePassword(this.newPassword).subscribe({
            next: (response) => {
                console.log("mdp", this.newPassword);
                console.log('Réponse reçue de l\'API:', response);
        
                // Vérifiez si la réponse contient un token
                if (response && response.token) {
                    alert('Le mot de passe a été changé avec succès');
                    this.router.navigate(['/']);
                } else {
                    alert('Une erreur est survenue lors du changement de mot de passe');
                }
            },
            error: (err) => {
                console.error('Erreur lors du changement de mot de passe:', err);
                if (err.error) {
                    console.log('Détails de l\'erreur:', err.error);
                }
                alert('Une erreur est survenue lors du changement de mot de passe');
            }
        });
    }
}