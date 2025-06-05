import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { User } from 'src/app/core/models/User.model';
import { UserService } from 'src/app/core/services/user.service';

@Component({
  selector: 'app-profil',
  templateUrl: './profil.component.html',
  styleUrls: ['./profil.component.scss'],
  providers: [MessageService]
})
export class ProfilComponent implements OnInit {
  userForm!: FormGroup;
  userRole: string = '';
  user!: User;
  editMode: boolean = false;
  loading: boolean = false;
  userProfileImage: string | null = null;

   uploadedFiles: any[] = [];
  displayImageDialog: boolean = false;

  constructor(
    private userService: UserService, 
    private fb: FormBuilder,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadUserData();
  }

  private initForm(): void {
    this.userForm = this.fb.group({
      firstname: ['', Validators.required],
      lastname: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      tel: ['', [Validators.required, Validators.pattern(/^[0-9+\s()-]{8,15}$/)]]
    });
  }

  private loadUserData(): void {
    this.loading = true;
    this.userService.getCurrentUser().subscribe({
      next: (userData: User) => {
        this.user = userData;
        this.userRole = userData.role;
        this.userProfileImage = this.userService.getProfileImageUrl(userData.imageProfil);        
        this.userForm.patchValue({
          firstname: this.user.firstname,
          lastname: this.user.lastname,
          email: this.user.email,
          tel: this.user.tel
        });
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement du profil :', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de charger votre profil'
        });
        this.loading = false;
      }
    });
  }

  // Méthode pour l'upload d'image
  onUpload(event: any, userId: number): void {
     if (!event?.files?.length) return;
    
    this.loading = true;
    this.userService.uploadProfileImage(userId, event.files[0]).subscribe({
      next: (response: any) => {
        this.userProfileImage = this.userService.getProfileImageUrl(response.imageUrl);
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Profile image updated'
        });
        this.loading = false;
        this.displayImageDialog = false;
      },
      error: (err) => {
        console.error('Erreur lors de l\'upload de l\'image', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Échec de la mise à jour de l\'image'
        });
        this.loading = false;
      }
    });
  }

// Méthode pour supprimer l'image
removeImage(userId: number): void {
  this.loading = true;
  this.userService.removeProfileImage(userId).subscribe({
    next: (response) => {
      this.userProfileImage = null;
      // Update the user object as well
      if (this.user) {
        this.user.imageProfil = null;
      }
      
      this.messageService.add({
        severity: 'success',
        summary: 'Succès',
        detail: response?.message || 'Image de profil supprimée'
      });
      this.loading = false;
    },
    error: (err) => {
      console.error('Erreur lors de la suppression de l\'image', err);
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: err.message || 'Échec de la suppression de l\'image'
      });
      this.loading = false;
    }
  });
}

  enableEdit(): void {
    this.editMode = true;
    
    // S'assurer que le formulaire n'est pas désactivé
    this.userForm.enable();
    
    // Mettre à jour le formulaire avec les valeurs actuelles
    this.userForm.patchValue({
      firstname: this.user.firstname,
      lastname: this.user.lastname,
      email: this.user.email,
      tel: this.user.tel
    });
  }

  cancelEdit(): void {
    this.editMode = false;
    // Réinitialiser le formulaire aux valeurs d'origine
    this.userForm.patchValue({
      firstname: this.user.firstname,
      lastname: this.user.lastname,
      email: this.user.email,
      tel: this.user.tel
    });
  }

  onSubmit(): void {
    console.log('Formulaire soumis', this.userForm.value);
    console.log('Validité du formulaire:', this.userForm.valid);
    
    if (this.userForm.valid) {
      this.loading = true;
      const updatedUser: User = { 
        ...this.user, 
        ...this.userForm.value 
      };
      
      console.log('Envoi de la mise à jour:', updatedUser);
      
      this.userService.updateUser(updatedUser).subscribe({
        next: (response) => {
          this.user = response || updatedUser;
          this.messageService.add({
            severity: 'success',
            summary: 'Succès',
            detail: 'Profil mis à jour avec succès'
          });
          this.editMode = false;
          this.loading = false;
        },
        error: (err) => {
          console.error('Erreur lors de la mise à jour du profil :', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: 'La mise à jour du profil a échoué'
          });
          this.loading = false;
        }
      });
    } else {
      // Marquer tous les champs comme touchés pour afficher les erreurs
      Object.keys(this.userForm.controls).forEach(key => {
        this.userForm.get(key)?.markAsTouched();
      });
      
      this.messageService.add({
        severity: 'warn',
        summary: 'Attention',
        detail: 'Veuillez corriger les erreurs dans le formulaire'
      });
    }
  }
}