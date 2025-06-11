import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { Assujetti } from 'src/app/core/models/Assujetti.model';
import { TypeVocabulaire } from 'src/app/core/models/TypeVocabulaire.model';
import { User } from 'src/app/core/models/User.model';
import { Vocabulaire } from 'src/app/core/models/Vocabulaire.model';
import { gestionAssujettiService } from 'src/app/core/services/gestion-assujetti.service';
import { LoginService } from 'src/app/core/services/login.service';

@Component({
  templateUrl: './crud-assujettis.component.html',
  selector: 'app-vocabulaire',
  providers: [MessageService]
})
export class CrudAssujettisComponent implements OnInit {
    assujettiDialog: boolean = false;
    deleteAssujettiDialog: boolean = false;
    deleteAssujettisDialog: boolean = false;

    assujettis: Assujetti[] = [];
    assujetti: Assujetti = new Assujetti();
    selectedAssujettis: Assujetti[] = [];
    submitted: boolean = false;

    selectedTypeVocabulaire: TypeVocabulaire | null = null;
    sourceCities: TypeVocabulaire[] = [];
    cols: any[] = [];
    isSearching: boolean = false;
    searchQuery: string = '';
    selectedVoc: { [key: string]: any } = {};
    vocabulaireListByType: { [key: number]: Vocabulaire[] } = {};
    typesVocabulaire: TypeVocabulaire[] = [];
    vocabulaireList: Vocabulaire[] = [];
    selectedVocabulaire: Vocabulaire;

    // Variables manquantes
showArchived: boolean = false;
restoreAssujettiDialog: boolean = false;
restoreAssujettisDialog: boolean = false;

    constructor(
      private assujettiService: gestionAssujettiService, 
      private messageService: MessageService,
      private loginService: LoginService
    ) { }
// 1. Correction des propriétés dans la classe
civilites: Vocabulaire[] = [];
administrations: Vocabulaire[] = [];
fonctions: Vocabulaire[] = [];
institutions: Vocabulaire[] = [];
entites: Vocabulaire[] = [];

// 2. Correction du ngOnInit
ngOnInit() {
  this.cols = [
    { field: 'code', header: 'Code' },
    { field: 'nom', header: 'Nom & Prenom' },
    { field: 'email', header: 'E-mail' },
    { field: 'fonction', header: 'Fonction' },
    { field: 'datep', header: 'Date Prise de Service' },
    { field: 'contacttel', header: 'Contact' },
    { field: 'etat', header: 'Etat' }
  ];

  // Charger les types de vocabulaire d'abord
  this.assujettiService.getTypesVocabulaire().subscribe({
    next: (types) => {
      this.typesVocabulaire = types;
      console.log('Types de vocabulaire chargés:', types);
      
      // Charger chaque type de vocabulaire spécifique
      types.forEach(type => {
        console.log('Traitement du type:', type.intitule, 'ID:', type.id);
        switch(type.intitule.toLowerCase()) {
          case 'civilite':
            this.loadVocabulairesByType(type.id, 'civilites');
            break;
          case 'administration':
            this.loadVocabulairesByType(type.id, 'administrations');
            break;
          case 'fonction':
            this.loadVocabulairesByType(type.id, 'fonctions');
            break;
          case 'institutions':
            this.loadVocabulairesByType(type.id, 'institutions');
            break;
          case 'entite':
            this.loadVocabulairesByType(type.id, 'entites');
            break;
          default:
            console.warn('Type de vocabulaire non reconnu:', type.intitule);
        }
      });
    },
    error: (err) => console.error('Erreur chargement types vocabulaire', err)
  });
  
  this.getAllAssujettis();
  this.loadAssujettis();
}

// 3. Ajout de la méthode loadVocabulairesByType
loadVocabulairesByType(typeId: number, propertyName: string) {
  this.assujettiService.getVocabulaireByType(typeId).subscribe({
    next: (vocabulaires) => {
      console.log(`Vocabulaires ${propertyName} chargés:`, vocabulaires);
      (this as any)[propertyName] = vocabulaires;
    },
    error: (err) => {
      console.error(`Erreur chargement ${propertyName}:`, err);
    }
  });
}



getIntitule(vocabulaire: Vocabulaire): string {
  return vocabulaire?.intitule || '';
}
    loadAssujettis() {
      this.assujettiService.getAllAssujettis().subscribe((data) => {
        this.assujettis = data;
      });
    }

    onTypeVocabulaireChange() {
      if (this.selectedTypeVocabulaire) {
        this.assujettiService.getVocabulaireByTypeId(this.selectedTypeVocabulaire.id).subscribe((vocabulaire) => {
          this.vocabulaireList = vocabulaire;
          console.log("Vocabulaire chargé:", this.vocabulaireList);
        }, error => {
          console.error("Erreur de récupération des vocabulaires:", error);
        });
      }
    }

    toggleSearch() {
      this.isSearching = !this.isSearching;
      if (!this.isSearching) {
        this.searchQuery = '';
      }
    }
        // Méthode pour récupérer les assujettis archivés
        getAllStoppedAssujettis(): void {
          this.assujettiService.getAllStopped().subscribe(
            (data: Assujetti[]) => {
              this.assujettis = data;
              console.log('Liste des assujettis archivés:', this.assujettis);
            },
            (error) => {
              console.error('Erreur lors du chargement des assujettis archivés:', error);
              this.messageService.add({
                severity: 'error',
                summary: 'Erreur',
                detail: 'Impossible de charger les assujettis archivés'
              });
            }
          );
        }

    getAllAssujettis(): void {
      this.assujettiService.getAllAssujettis().subscribe(
        (data: Assujetti[]) => {
          this.assujettis = data;
          console.log('Liste des assujettis:', this.assujettis);
        },
        (error) => {
          console.error('Erreur lors du chargement des assujettis:', error);
        }
      );
    }

    openNew() {
      this.assujetti = new Assujetti();
      this.submitted = false;
      this.assujettiDialog = true;
    }

    saveAssujetti() {
      this.submitted = true;
      
      Object.keys(this.selectedVoc).forEach(key => {
        this.assujetti[key] = this.selectedVoc[key];
      });
    
      const champsManquants: string[] = [];
      
      if (!this.assujetti.code) champsManquants.push('Code');
      if (!this.assujetti.nom) champsManquants.push('Nom & Prénom');
      if (!this.assujetti.email) champsManquants.push('Email');
      if (!this.assujetti.fonction) champsManquants.push('Fonction');
      if (!this.assujetti.datePriseDeService) champsManquants.push('Date de prise de service');
      if (!this.assujetti.contacttel) champsManquants.push('Contact téléphonique');
    
      if (champsManquants.length > 0) {
        this.messageService.add({
          severity: 'error', 
          summary: 'Champs obligatoires manquants', 
          detail: 'Tous les champs sont obligatoires'
        });
        return;
      }
      
      if (typeof this.assujetti.email === 'string' && !this.validateEmail(this.assujetti.email)) {
        this.messageService.add({
          severity: 'error', 
          summary: 'Format invalide', 
          detail: 'Format d\'email invalide'
        });
        return;
      }
      
      if (typeof this.assujetti.contacttel === 'string' && 
          (this.assujetti.contacttel.length !== 8 || !/^\d+$/.test(this.assujetti.contacttel))) {
        this.messageService.add({
          severity: 'error', 
          summary: 'Format invalide', 
          detail: 'Le numéro de téléphone doit comporter exactement 8 chiffres'
        });
        return;
      }
      
      const userId = this.loginService.getUserId();
      if (!userId) {
        this.messageService.add({
          severity: 'error', 
          summary: 'Erreur', 
          detail: 'Utilisateur non connecté. Impossible d\'ajouter l\'assujetti'
        });
        return;
      }
    
      const userIdNumber = Number(userId); 
      if (isNaN(userIdNumber)) {
        this.messageService.add({
          severity: 'error', 
          summary: 'Erreur', 
          detail: 'L\'ID utilisateur est invalide'
        });
        return;
      }
      
      const administrateur: User = { id: userIdNumber } as User;
      this.assujetti.administrateur = administrateur;
    
      console.log("Données envoyées :", this.assujetti); 
    
      if (this.assujetti.id) {
        this.assujettiService.updateAssujetti(this.assujetti.id, this.assujetti).subscribe({
          next: (response) => {
            console.log("Réponse du backend (update) :", response);
            this.messageService.add({
              severity: 'success', 
              summary: 'Succès', 
              detail: 'Assujetti mis à jour avec succès'
            });
            this.getAllAssujettis();  
            this.assujettiDialog = false;
            this.assujetti = new Assujetti();
            this.submitted = false;
          },
          error: (error) => {
            console.error("Erreur lors de la mise à jour :", error);
            this.messageService.add({
              severity: 'error', 
              summary: 'Erreur', 
              detail: error.error?.message || 'Erreur lors de la mise à jour de l\'assujetti'
            });
          }
        });
      } else {
        this.assujettiService.createAssujetti(this.assujetti).subscribe({
          next: (response) => {
            console.log("Réponse du backend (create) :", response);
            this.messageService.add({
              severity: 'success', 
              summary: 'Succès', 
              detail: 'Assujetti créé avec succès'
            });
            this.getAllAssujettis();  
            this.assujettiDialog = false;
            this.assujetti = new Assujetti();
            this.submitted = false;
          },
          error: (error) => {
            console.error("Erreur lors de la création :", error);
            this.messageService.add({
              severity: 'error', 
              summary: 'Erreur', 
              detail: error.error?.message || 'Erreur lors de la création de l\'assujetti'
            });
          }
        });
      }
    }
    
    validateEmail(email: string): boolean {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      return emailRegex.test(email);
    }
editAssujetti(assujetti: Assujetti) {
  this.assujetti = { ...assujetti };
  this.selectedVoc = {};
  
  // Mapper les vocabulaires existants
  if (assujetti.civilite) {
    this.selectedVoc['civilites'] = assujetti.civilite;
  }
  if (assujetti.administration) {
    this.selectedVoc['Administration'] = assujetti.administration;
  }
  if (assujetti.fonction) {
    this.selectedVoc['Fonction'] = assujetti.fonction;
  }
  if (assujetti.institutions) {
    this.selectedVoc['institutions'] = assujetti.institutions;
  }
  if (assujetti.entite) {
    this.selectedVoc['entites'] = assujetti.entite;
  }
  
  this.assujettiDialog = true;
}
    
    deleteAssujetti(assujetti: Assujetti) {
      this.assujetti = assujetti;
      this.deleteAssujettiDialog = true;
    }

    confirmDelete() {
      this.assujettiService.archiveAssujetti(this.assujetti.id).subscribe({
        next: () => {
          this.loadAssujettis();
          this.messageService.add({
            severity: 'success',
            summary: 'Archivage',
            detail: 'Assujetti archivé avec succès'
          });
          this.deleteAssujettiDialog = false;
          this.assujetti = new Assujetti();
        },
        error: (err) => {
          console.error('Erreur lors de l\'archivage:', err);
          
          if (err.status === 400) {
            this.messageService.add({
              severity: 'error',
              summary: 'Erreur',
              detail: err.error?.message || 'Impossible d\'archiver cet assujetti'
            });
          }
          this.deleteAssujettiDialog = false;
        }
      });
    }

    deleteSelectedAssujetti(): void {
      if (!this.selectedAssujettis || this.selectedAssujettis.length === 0) {
        this.messageService.add({
          severity: 'warn', 
          summary: 'Aucune sélection', 
          detail: 'Aucun assujetti sélectionné'
        });
        return;
      }
      
      this.deleteAssujettisDialog = true;
    }

    confirmDeleteSelected() {
      let successCount = 0;
      let errorCount = 0;
      const totalCount = this.selectedAssujettis.length;
      
      this.selectedAssujettis.forEach(assujetti => {
        if (assujetti && assujetti.id) {
          this.assujettiService.archiveAssujetti(assujetti.id).subscribe({
            next: () => {
              console.log(`Assujetti ${assujetti.id} archivé.`);
              this.assujettis = this.assujettis.filter(a => a.id !== assujetti.id);
              successCount++;
              
              this.messageService.add({
                severity: 'success',
                summary: 'Archivage',
                detail: `Assujetti ${assujetti.code} archivé avec succès`
              });
              
              if (successCount + errorCount === totalCount) {
                this.loadAssujettis();
                this.deleteAssujettisDialog = false;
                this.selectedAssujettis = [];
              }
            },
            error: (err) => {
              console.error(`Erreur lors de l'archivage de l'assujetti ${assujetti.id}`, err);
              errorCount++;
              
              if (err.status === 400) {
                this.messageService.add({
                  severity: 'error',
                  summary: 'Erreur',
                  detail: err.error?.message || `Impossible d'archiver l'assujetti ${assujetti.code}`
                });
              } else {
                this.messageService.add({
                  severity: 'error',
                  summary: 'Erreur',
                  detail: `Erreur lors de l'archivage de l'assujetti ${assujetti.code}`
                });
              }
              
              if (successCount + errorCount === totalCount) {
                this.deleteAssujettisDialog = false;
                this.selectedAssujettis = [];
              }
            }
          });
        }
      });
    }


    onGlobalFilter(dt: any, event: any) {
      const query = event.target.value;
      dt.filterGlobal(query, 'contains');
    }
    // Méthode pour basculer entre les listes d'assujettis actifs et archivés
toggleAssujettisList() {
  if (this.showArchived) {
    this.getAllStoppedAssujettis();
  } else {
    this.getAllAssujettis();
  }
  this.selectedAssujettis = [];
}

// Méthode pour restaurer un assujetti archivé
restoreAssujetti(assujetti: Assujetti) {
  this.assujetti = assujetti;
  this.restoreAssujettiDialog = true;
}

// Méthode pour confirmer la restauration d'un assujetti
confirmRestore() {
  this.assujettiService.restoreAssujetti(this.assujetti.id).subscribe({
    next: () => {
      this.getAllStoppedAssujettis(); // Recharger la liste des assujettis archivés
      this.messageService.add({
        severity: 'success',
        summary: 'Restauration',
        detail: 'Assujetti restauré avec succès'
      });
      this.restoreAssujettiDialog = false;
      this.assujetti = new Assujetti();
    },
    error: (err) => {
      console.error('Erreur lors de la restauration:', err);
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: err.error?.message || 'Impossible de restaurer cet assujetti'
      });
      this.restoreAssujettiDialog = false;
    }
  });
}

// Méthode pour restaurer les assujettis sélectionnés
restoreSelectedAssujettis() {
  if (!this.selectedAssujettis || this.selectedAssujettis.length === 0) {
    this.messageService.add({
      severity: 'warn',
      summary: 'Aucune sélection',
      detail: 'Aucun assujetti sélectionné'
    });
    return;
  }
  
  this.restoreAssujettisDialog = true;
}

// Méthode pour confirmer la restauration des assujettis sélectionnés
confirmRestoreSelected() {
  let successCount = 0;
  let errorCount = 0;
  const totalCount = this.selectedAssujettis.length;
  
  this.selectedAssujettis.forEach(assujetti => {
    if (assujetti && assujetti.id) {
      this.assujettiService.restoreAssujetti(assujetti.id).subscribe({
        next: () => {
          console.log(`Assujetti ${assujetti.id} restauré.`);
          this.assujettis = this.assujettis.filter(a => a.id !== assujetti.id);
          successCount++;
          
          this.messageService.add({
            severity: 'success',
            summary: 'Restauration',
            detail: `Assujetti ${assujetti.code} restauré avec succès`
          });
          
          if (successCount + errorCount === totalCount) {
            this.getAllStoppedAssujettis(); // Mettre à jour la liste des assujettis archivés
            this.restoreAssujettisDialog = false;
            this.selectedAssujettis = [];
          }
        },
        error: (err) => {
          console.error(`Erreur lors de la restauration de l'assujetti ${assujetti.id}`, err);
          errorCount++;
          
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: err.error?.message || `Impossible de restaurer l'assujetti ${assujetti.code}`
          });
          
          if (successCount + errorCount === totalCount) {
            this.restoreAssujettisDialog = false;
            this.selectedAssujettis = [];
          }
        }
      });
    }
  });
}

    
}
