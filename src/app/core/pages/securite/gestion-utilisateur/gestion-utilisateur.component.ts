import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { User } from 'src/app/core/models/User.model';
import { UserService } from 'src/app/core/services/user.service';

@Component({
  templateUrl: './gestion-utilisateur.component.html',
  providers: [MessageService],
})
export class GestionUtilisateurComponent implements OnInit {
  users: User[] = [];
  selectedUsers: User[] = [];
  isSearching: boolean = false;
  searchQuery: string = '';
  roles: string[] = [];
  newUser: User = {
    firstname: '',
    lastname: '',
    email: '',
    tel: '',
    role: ''
  };
  isAddingUser: boolean = false;
  isEditingUser: boolean = false;  
  userToEdit: User | null = null;
  
  // Ajout des dialogues de confirmation
  deleteUserDialog: boolean = false;
  deleteUsersDialog: boolean = false;
  userToDelete: User | null = null;

  showArchived: boolean = false;
  restoreUserDialog: boolean = false;
  restoreUsersDialog: boolean = false;
  userToRestore: User | null = null;

  constructor(private userService: UserService, private messageService: MessageService) {}

  ngOnInit() {
    this.loadUsers();
    this.getRoles();
  }

  loadUsers(): void {
    this.userService.getAllUsers().subscribe({
      next: (data) => {
        this.users = data;
      },
      error: (err) => {
        console.error('Erreur lors de la récupération des utilisateurs', err);
      }
    });
  }

  getRoles(): void {
    this.userService.getRoles().subscribe(
      (roles) => {
        this.roles = roles;
      },
      (error) => {
        console.error('Erreur lors de la récupération des rôles', error);
      }
    );
  }

   // Méthode pour basculer entre les utilisateurs actifs et archivés
   toggleUsersList(): void {
    this.selectedUsers = []; // Réinitialiser la sélection
    if (this.showArchived) {
      this.loadArchivedUsers();
    } else {
      this.loadUsers();
    }
  }
  toggleSearch() {
    this.isSearching = !this.isSearching;
    if (!this.isSearching) {
      this.searchQuery = '';
    }
  }

  // Méthode pour charger les utilisateurs archivés
  loadArchivedUsers(): void {
    this.userService.getAllArchivedUsers().subscribe({
      next: (data) => {
        this.users = data;
      },
      error: (err) => {
        console.error('Erreur lors de la récupération des utilisateurs archivés', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de charger les utilisateurs archivés'
        });
      }
    });
  }

  // Méthode pour restaurer un seul utilisateur
  restoreUser(user: User): void {
    this.userToRestore = user;
    this.restoreUserDialog = true;
  }

  // Confirmation de restauration d'un seul utilisateur
  confirmRestoreUser(): void {
    if (this.userToRestore && this.userToRestore.id) {
      this.userService.restoreUser(this.userToRestore.id).subscribe({
        next: () => {
          this.users = this.users.filter(u => u.id !== this.userToRestore?.id);
          this.messageService.add({
            severity: 'success',
            summary: 'Utilisateur restauré',
            detail: `${this.userToRestore?.firstname} a été restauré avec succès.`,
          });
          this.restoreUserDialog = false;
          this.userToRestore = null;
        },
        error: (err) => {
          console.error('Erreur lors de la restauration de l\'utilisateur', err);
          
          let errorMessage = `Impossible de restaurer ${this.userToRestore?.firstname}.`;
          
          try {
            const parsedError = typeof err.error === 'string'
              ? JSON.parse(err.error)
              : err.error;

            if (err.status === 400 && parsedError?.message) {
              errorMessage = parsedError.message;
            }
          } catch (parseError) {
            console.error('Erreur lors de l\'analyse de la réponse :', parseError);
          }

          this.messageService.add({
            severity: 'error',
            summary: 'Erreur de restauration',
            detail: errorMessage,
          });
          this.restoreUserDialog = false;
        }
      });
    }
  }

  // Méthode pour restaurer plusieurs utilisateurs
  restoreSelectedUsers(): void {
    if (!this.selectedUsers || this.selectedUsers.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Aucun utilisateur sélectionné',
        detail: 'Veuillez sélectionner au moins un utilisateur.',
      });
      return;
    }
    this.restoreUsersDialog = true;
  }

  // Confirmation de restauration de plusieurs utilisateurs
  confirmRestoreSelectedUsers(): void {
    let successCount = 0;
    let errorCount = 0;
    const totalCount = this.selectedUsers.length;

    this.selectedUsers.forEach(user => {
      if (user && user.id) {
        this.userService.restoreUser(user.id).subscribe({
          next: () => {
            this.users = this.users.filter(u => u.id !== user.id);
            successCount++;
            
            this.messageService.add({
              severity: 'success',
              summary: 'Succès',
              detail: `Utilisateur ${user.firstname} restauré.`,
            });
            
            if (successCount + errorCount === totalCount) {
              this.restoreUsersDialog = false;
              this.selectedUsers = [];
              this.loadArchivedUsers(); // Rafraîchir la liste des utilisateurs archivés
            }
          },
          error: (err) => {
            console.error('Erreur HTTP reçue:', err);
            errorCount++;
            
            let errorMessage = `Impossible de restaurer ${user.firstname}.`;
            
            try {
              const parsedError = typeof err.error === 'string' 
                ? JSON.parse(err.error) 
                : err.error;

              if (err.status === 400 && parsedError?.message) {
                errorMessage = parsedError.message;
              }
            } catch (parseError) {
              console.error('Erreur lors de l\'analyse de la réponse :', parseError);
            }

            this.messageService.add({
              severity: 'error',
              summary: 'Erreur de restauration',
              detail: errorMessage,
            });
            
            if (successCount + errorCount === totalCount) {
              this.restoreUsersDialog = false;
              this.selectedUsers = [];
            }
          }
        });
      }
    });
  }

  // Modification pour le filtre global selon que l'on soit en mode archivé ou non
  onGlobalFilter(table: Table, event: Event) {
    const query = (event.target as HTMLInputElement).value;
    if (query) {
      this.userService.getUsersByName(query).subscribe((filteredUsers) => {
        this.users = filteredUsers;
      });
    } else {
      if (this.showArchived) {
        this.loadArchivedUsers();
      } else {
        this.loadUsers();
      }
    }
  }

  addUserForm(): void {
    this.isAddingUser = true;
  }

  saveNewUser(): void {
    if (this.newUser && this.newUser.firstname && this.newUser.lastname && this.newUser.email && this.newUser.tel && this.newUser.role) {
      this.userService.addUser(this.newUser).subscribe(
        (createdUser) => {
          this.users.push(createdUser);
          this.cancelNewUser();
          this.messageService.add({
            severity: 'success',
            summary: 'Utilisateur ajouté',
            detail: `${createdUser.firstname} ${createdUser.lastname} a été ajouté avec succès.`,
          });
        },
        (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: `Impossible d'ajouter l'utilisateur. Vérifiez les informations.`,
          });
        }
      );
    } else {
      this.messageService.add({
        severity: 'warn',
        summary: 'Champs manquants',
        detail: 'Tous les champs obligatoires doivent être remplis.',
      });
    }
  }

  cancelNewUser(): void {
    this.newUser = {
      firstname: '',
      lastname: '',
      email: '',
      tel: '',
      role: ''
    };
    this.isAddingUser = false;
  }

  // Modification de la méthode de suppression pour afficher la confirmation
  deleteUser(user: User): void {
    this.userToDelete = user;
    this.deleteUserDialog = true;
  }

  // Méthode de confirmation de suppression
  confirmDeleteUser(): void {
    if (this.userToDelete && this.userToDelete.id) {
      this.userService.archiveUser(this.userToDelete.id).subscribe({
        next: () => {
          this.users = this.users.filter(u => u.id !== this.userToDelete?.id);
          this.messageService.add({
            severity: 'success',
            summary: 'Utilisateur archivé',
            detail: `${this.userToDelete?.firstname} a été archivé avec succès.`,
          });
          this.deleteUserDialog = false;
          this.userToDelete = null;
        },
        error: (err) => {
          console.log('Erreur HTTP reçue:', err);
          let errorMessage = `Impossible d’archiver ${this.userToDelete?.firstname}.`;

          try {
            const parsedError = typeof err.error === 'string'
              ? JSON.parse(err.error)
              : err.error;

            if (err.status === 400 && parsedError?.message) {
              errorMessage = parsedError.message;
            }
          } catch (parseError) {
            console.error('Erreur lors de l’analyse de la réponse :', parseError);
          }

          this.messageService.add({
            severity: 'error',
            summary: 'Erreur d’archivage',
            detail: errorMessage,
          });
          this.deleteUserDialog = false;
        }
      });
    }
  }

  // Modification de la méthode de suppression multiple pour afficher la confirmation
  archiveSelectedUser(): void {
    if (!this.selectedUsers || this.selectedUsers.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Aucun utilisateur sélectionné',
        detail: 'Veuillez sélectionner au moins un utilisateur.',
      });
      return;
    }
    this.deleteUsersDialog = true;
  }

  // Méthode de confirmation de suppression multiple
  confirmDeleteSelectedUsers(): void {
    let successCount = 0;
    let errorCount = 0;
    const totalCount = this.selectedUsers.length;

    this.selectedUsers.forEach(user => {
      if (user && user.id) {
        this.userService.archiveUser(user.id).subscribe({
          next: () => {
            this.users = this.users.filter(u => u.id !== user.id);
            successCount++;
            
            this.messageService.add({
              severity: 'success',
              summary: 'Succès',
              detail: `Utilisateur ${user.firstname} archivé.`,
            });
            
            if (successCount + errorCount === totalCount) {
              this.deleteUsersDialog = false;
              this.selectedUsers = [];
              this.loadUsers();
            }
          },
          error: (err) => {
            console.log('Erreur HTTP reçue:', err);
            errorCount++;
            
            let errorMessage = `Impossible d’archiver ${user.firstname}.`;
            
            try {
              const parsedError = typeof err.error === 'string' 
                ? JSON.parse(err.error) 
                : err.error;

              if (err.status === 400 && parsedError?.message) {
                errorMessage = parsedError.message;
              }
            } catch (parseError) {
              console.error('Erreur lors de l’analyse de la réponse :', parseError);
            }

            this.messageService.add({
              severity: 'error',
              summary: 'Erreur d’archivage',
              detail: errorMessage,
            });
            
            if (successCount + errorCount === totalCount) {
              this.deleteUsersDialog = false;
              this.selectedUsers = [];
            }
          }
        });
      }
    });
  }

  editUser(user: User): void {
    this.isEditingUser = true;
    this.userToEdit = { ...user }; 
  }

  cancelEditUser(): void {
    this.isEditingUser = false;
    this.userToEdit = null;
  }

  saveUpdatedUser(): void {
    if (this.userToEdit && this.userToEdit.id && this.userToEdit.firstname && this.userToEdit.lastname && this.userToEdit.email && this.userToEdit.tel && this.userToEdit.role) {
      this.userService.updateUser(this.userToEdit).subscribe({
        next: (updatedUser) => {
          const index = this.users.findIndex(user => user.id === updatedUser.id);
          if (index !== -1) {
            this.users[index] = updatedUser;
          }
          this.cancelEditUser();
          
          this.messageService.add({
            severity: 'success',
            summary: 'Utilisateur mis à jour',
            detail: `${updatedUser.firstname} ${updatedUser.lastname} a été mis à jour avec succès.`,
          });
        },
        error: (err) => {
          console.log('Erreur reçue dans saveUpdatedUser:', err);
          
          if (err.status === 400) {
            console.log('Contenu de l\'erreur 400:', err.error);
            
            let errorDetail = 'Certains champs sont invalides. Veuillez vérifier les informations.';
            
            if (err.error) {
              if (typeof err.error === 'object' && !Array.isArray(err.error)) {
                const errorMessages = [];
                
                for (const [field, message] of Object.entries(err.error)) {
                  errorMessages.push(`${field}: ${message}`);
                }
                
                if (err.error.message) {
                  errorMessages.push(err.error.message);
                }
                
                if (errorMessages.length > 0) {
                  errorDetail = errorMessages.join(', ');
                }
              }
              else if (typeof err.error === 'string') {
                try {
                  const parsedError = JSON.parse(err.error);
                  if (parsedError.message) {
                    errorDetail = parsedError.message;
                  }
                } catch (e) {
                  if (err.error) {
                    errorDetail = err.error;
                  }
                }
              }
            }
            
            this.messageService.add({
              severity: 'warn',
              summary: 'Erreur de validation',
              detail: errorDetail
            });
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'Erreur',
              detail: err.message || 'Impossible de mettre à jour l\'utilisateur. Essayez à nouveau.'
            });
          }
        }
      });
    } else {
      this.messageService.add({
        severity: 'warn',
        summary: 'Champs manquants',
        detail: 'Tous les champs obligatoires doivent être remplis.',
      });
    }
  }

  
}