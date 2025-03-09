import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from 'src/app/core/services/user.service';

@Component({
    selector: 'app-access',
    templateUrl: './access.component.html',
})
export class AccessComponent {
    value8: any;

    newPassword: string = '';

  constructor(private userService: UserService, private router: Router) {}

  changePassword() {
    console.log('Tentative de changement de mot de passe...');
    this.userService.changePassword(this.newPassword).subscribe({
      next: (response) => {
        console.log("mdp",this.newPassword);
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
  
  
  
  
 