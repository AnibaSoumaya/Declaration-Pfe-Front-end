import { Component, OnInit } from '@angular/core';
import { Table } from 'primeng/table';
import { User } from 'src/app/core/models/User.model';
import { UserService } from 'src/app/core/services/user.service';

@Component({
  templateUrl: './gestion-utilisateur.component.html',
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
  isEditingUser: boolean = false;  // Indicateur si on est en train d’éditer un utilisateur
  userToEdit: User | null = null;  // Utilisateur à éditer

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.userService.getAllUsers().subscribe({
      next: (data) => {
        this.users = data;
      },
      error: (err) => {
        console.error('Erreur lors de la récupération des utilisateurs', err);
      }
    });

    this.getRoles();
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

  toggleSearch() {
    this.isSearching = !this.isSearching;
    if (!this.isSearching) {
      this.searchQuery = '';
    }
  }

  onGlobalFilter(table: Table, event: Event) {
    const query = (event.target as HTMLInputElement).value;
    if (query) {
      this.userService.getUsersByName(query).subscribe((filteredUsers) => {
        this.users = filteredUsers;
      });
    } else {
      this.userService.getAllUsers().subscribe((users) => {
        this.users = users;
      });
    }
  }

  addUserForm(): void {
    this.isAddingUser = true;
  }

  saveNewUser(): void {
    if (this.newUser && this.newUser.role) {
      this.userService.addUser(this.newUser).subscribe((createdUser) => {
        this.users.push(createdUser);
        this.cancelNewUser();
      });
    } else {
      console.error('Le rôle de l’utilisateur est requis');
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

  archiveSelectedUser(): void {
    if (!this.selectedUsers || this.selectedUsers.length === 0) {
      console.log('Aucun utilisateur sélectionné.');
      return;
    }

    this.selectedUsers.forEach(user => {
      if (user && user.id) {
        this.userService.archiveUser(user.id).subscribe({
          next: () => {
            console.log(`Utilisateur ${user.id} archivé.`);
            this.users = this.users.filter(u => u.id !== user.id);
          },
          error: (err) => {
            console.error(`Erreur lors de l’archivage de l’utilisateur ${user.id}`, err);
          }
        });
      }
    });

    this.selectedUsers = [];
  }

  // Méthode pour activer le mode édition
  editUser(user: User): void {
    this.isEditingUser = true;
    this.userToEdit = { ...user }; // Créer une copie de l'utilisateur à modifier
  }

  // Méthode pour annuler l'édition
  cancelEditUser(): void {
    this.isEditingUser = false;
    this.userToEdit = null;
  }

  // Méthode pour enregistrer l'utilisateur modifié
  saveUpdatedUser(): void {
    if (this.userToEdit) {
      this.userService.updateUser(this.userToEdit).subscribe({
        next: (updatedUser) => {
          const index = this.users.findIndex(user => user.id === updatedUser.id);
          if (index !== -1) {
            this.users[index] = updatedUser;  // Mettre à jour l'utilisateur dans la liste
          }
          this.cancelEditUser();
        },
        error: (err) => {
          console.error('Erreur lors de la mise à jour de l’utilisateur', err);
        }
      });
    }
  }
}
