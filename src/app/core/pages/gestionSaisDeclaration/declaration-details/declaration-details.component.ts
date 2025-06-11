import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { forkJoin, of } from 'rxjs';
import { Subject } from 'rxjs';
import { debounceTime, switchMap, map } from 'rxjs/operators';
import { Declaration } from 'src/app/core/models/declaration';
import { Rapport } from 'src/app/core/models/rapport';
import { User } from 'src/app/core/models/User.model';
import { DeclarationService } from 'src/app/core/services/declaration.service';
import { RapportService } from 'src/app/core/services/rapport.service';
import { UserService } from 'src/app/core/services/user.service';

@Component({
  selector: 'app-declaration-details',
  templateUrl: './declaration-details.component.html',
  styleUrls: ['./declaration-details.component.scss'],
  providers: [MessageService],
})
export class DeclarationDetailsComponent implements OnInit {
  declarations: Declaration[] = [];
  filteredDeclarations: Declaration[] = [];
  selectedDeclarations: Declaration[] = [];
  displayChangeManagerDialog = false;
  conseillers: User[] = [];
  avocatsGeneraux: User[] = [];
  selectedGerant: User | null = null;
  searchQuery: string = '';
  isSearching: boolean = false;
  currentUser: User | null = null;
  currentSortField: string = 'dateDeclaration';
currentSortOrder: number = -1; // -1 pour décroissant, 1 pour croissant
selectedProcureurGeneral: User | null = null;
displayTransferDialog = false;

  // Options pour le filtre par état
  etatOptions = [
    { label: 'Toutes', value: null },
    { label: 'En cours', value: 'en_cours' },
    { label: 'En traitement', value: 'traitement' },
    { label: 'En jugement', value: 'jugement' },
    { label: 'Validées', value: 'valider' },
    { label: 'Refusées', value: 'refuser' }
  ];

  etatOptions1 = [
    { label: 'Toutes', value: 'valider_refuser' },
    { label: 'Validées', value: 'valider' },
    { label: 'Refusées', value: 'refuser' }
  ];
  selectedEtat: string | null = null;


  // Options pour le type de recherche
  searchType: string = 'nom';
  searchTypeOptions = [
    { label: 'Assujetti', value: 'nom' },
    { label: 'Email', value: 'email' }
  ];

  constructor(
    private declarationService: DeclarationService,
    private utilisateurService: UserService,
    private router: Router,
    private route: ActivatedRoute,
    private rapportService: RapportService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.utilisateurService.getCurrentUser().subscribe(
      user => {
        this.currentUser = user;
        this.loadDeclarations();
        this.loadUsers();
      },
      error => {
        console.error("Erreur lors de la récupération de l'utilisateur connecté", error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: "Impossible de charger l'utilisateur courant"
        });
      }
    );
  }

  loadUsers(): void {
    this.utilisateurService.getAllUsers().subscribe(
      data => {
        this.conseillers = data
          .filter(user => user.role?.includes('conseiller_rapporteur'))
          .map(user => ({
            ...user,
            fullName: `${user.firstname} ${user.lastname}`
          }));
        
        this.avocatsGeneraux = data
          .filter(user => user.role?.includes('avocat_general'))
          .map(user => ({
            ...user,
            fullName: `${user.firstname} ${user.lastname}`
          }));
      },
      error => console.error('Erreur chargement utilisateurs', error)
    );
  }

  afficherDeclaration(id: number): void {
    this.router.navigate(['/controleDeclaration', id]);
  }

  /* filterByEtat() {
    if (!this.selectedEtat) {
      this.filteredDeclarations = [...this.declarations];
    } else {
      this.filteredDeclarations = this.declarations.filter(
        d => d.etatDeclaration?.toLowerCase() === this.selectedEtat?.toLowerCase()
      );
    }
  } */

   filterByEtat() {
  // 1. Filtrer les déclarations
  this.filteredDeclarations = !this.selectedEtat 
    ? [...this.declarations] 
    : this.declarations.filter(d => d.etatDeclaration?.toLowerCase() === this.selectedEtat?.toLowerCase());

  // 2. Appliquer le tri approprié
  if (this.hasProcureurGeneralRole() && !this.selectedEtat) {
    // Cas spécial: procureur général + "Toutes" => tri par ID décroissant
    this.filteredDeclarations.sort((a, b) => b.id - a.id);
  } else if (this.selectedEtat === 'jugement') {
    // Cas "En jugement": tri par date croissante (du plus ancien au plus récent)
    this.filteredDeclarations.sort((a, b) => 
      new Date(a.dateDeclaration).getTime() - new Date(b.dateDeclaration).getTime()
    );
  } else {
    // Par défaut: tri par date décroissante (du plus récent au plus ancien)
    this.filteredDeclarations.sort((a, b) => 
      new Date(b.dateDeclaration).getTime() - new Date(a.dateDeclaration).getTime()
    );
  }
}
downloadRapport(declarationId: number): void {
  this.rapportService.getByDeclaration(declarationId).subscribe({
    next: (rapports: Rapport[]) => {
      const rapportDefinitif = rapports.find(r => r.type === 'DEFINITIF');
      
      if (rapportDefinitif) {
        this.rapportService.telecharger(rapportDefinitif.id).subscribe({
          next: (response: Blob) => {
            const blob = new Blob([response], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const newWindow = window.open(url, '_blank');
            if (newWindow) {
              newWindow.focus();
            }
          },
          error: (err) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Erreur',
              detail: 'Échec du téléchargement du rapport',
              life: 5000
            });
          }
        });
      } else {
        this.messageService.add({
          severity: 'warn',
          summary: 'Avertissement',
          detail: 'Aucun rapport définitif disponible pour cette déclaration',
          life: 5000
        });
      }
    },
    error: (err) => {
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Impossible de récupérer les rapports',
        life: 5000
      });
    }
  });
}

hasAdminRole(): boolean {
  return this.currentUser?.role === 'administrateur';
}
filterForAdmin() {
  if (!this.declarations || this.declarations.length === 0) {
    this.filteredDeclarations = [];
    return;
  }

  switch (this.selectedEtat) {
    case null:
    case 'valider_refuser':
      // Par défaut, montre toutes les déclarations validées ou refusées
      this.filteredDeclarations = this.declarations;
      break;
    case 'valider':
      this.filteredDeclarations = this.declarations.filter(d => 
        d.etatDeclaration === 'valider'
      );
      break;
    case 'refuser':
      this.filteredDeclarations = this.declarations.filter(d => 
        d.etatDeclaration === 'refuser'
      );
      break;
    default:
      this.filteredDeclarations = [];
  }

  // Tri par défaut pour l'admin (date décroissante)
  this.filteredDeclarations.sort((a, b) => 
    new Date(b.dateDeclaration).getTime() - new Date(a.dateDeclaration).getTime()
  );
}

onSort(event: any) {
    // Si procureur général avec "Toutes" sélectionné, on bloque le tri manuel
    if (this.hasProcureurGeneralRole() && !this.selectedEtat) {
        // On réapplique le tri par ID décroissant
        this.currentSortField = 'id';
        this.currentSortOrder = -1;
        this.filteredDeclarations.sort((a, b) => b.id - a.id);
        return;
    }
    
    // Tri normal pour les autres cas
    this.currentSortField = event.field;
    this.currentSortOrder = event.order;
    
    this.filteredDeclarations.sort((a, b) => {
        if (event.field === 'dateDeclaration') {
            return (new Date(b.dateDeclaration).getTime() - new Date(a.dateDeclaration).getTime()) * event.order;
        } else {
            return (a[event.field] > b[event.field] ? 1 : -1) * event.order;
        }
    });
}

  getEtatLabel(etat: string | undefined): string {
    if (!etat) return 'Inconnu';
    return {
      'en_cours': 'En cours',
      'traitement': 'En traitement',
      'jugement': 'En jugement',
      'valider': 'Validée',
      'refuser': 'Refusée'
    }[etat.toLowerCase()] || etat;
  }

  getEtatBadgeClass(etat: string | undefined): string {
    const baseClass = 'declaration-badge p-tag p-tag-rounded';
    if (!etat) return baseClass + ' p-tag-secondary';
    
    switch(etat.toLowerCase()) {
      case 'en_cours': return baseClass + ' p-tag-info';
      case 'traitement': return baseClass + ' p-tag-warning';
      case 'jugement': return baseClass + ' p-tag-help';
      case 'valider': return baseClass + ' p-tag-success';
      case 'refuser': return baseClass + ' p-tag-danger';
      default: return baseClass + ' p-tag-secondary';
    }
  }

loadDeclarations(): void {
  if (this.hasAdminRole()) {
    // Pour l'admin, charger toutes les déclarations validées ou refusées
    this.declarationService.getValidatedOrRefusedDeclarations().subscribe({
      next: (declarations) => {
        this.declarations = declarations;
        this.filteredDeclarations = [...this.declarations];
      },
      error: (err) => {
        console.error('Erreur:', err);
        this.declarations = [];
        this.filteredDeclarations = [];
      }
    });
  } else if (this.currentUser?.id) {
    // Pour les autres utilisateurs, charger uniquement leurs déclarations
    this.declarationService.getDeclarationsByUser(this.currentUser.id).subscribe({
      next: (declarations) => {
        this.declarations = declarations;
        this.filteredDeclarations = [...this.declarations];
      },
      error: (err) => {
        console.error('Erreur:', err);
        this.declarations = [];
        this.filteredDeclarations = [];
      }
    });
  } else {
    console.error('ID utilisateur manquant');
    this.declarations = [];
    this.filteredDeclarations = [];
  }
}

 validerDeclaration(declarationId: number): void {
  // Vérifier que l'ID est bien un nombre
  if (typeof declarationId !== 'number') {
    console.error('ID de déclaration invalide :', declarationId);
    this.messageService.add({
      severity: 'error',
      summary: 'Erreur',
      detail: 'Identifiant de déclaration invalide.'
    });
    return;
  }

  console.log('Début de la validation pour la déclaration ID:', declarationId);

  // 1. Récupérer le procureur général pour cette déclaration
  this.declarationService.getFirstUtilisateurByRoleAndDeclaration(declarationId, 'procureur_general')
    .pipe(
      switchMap(procureurGeneral => {
        console.log('Procureur général récupéré :', procureurGeneral);

        if (!procureurGeneral) {
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: 'Aucun procureur général trouvé pour cette déclaration.'
          });
          // On retourne un Observable vide pour arrêter le flux
          return of(null);
        }

        // 2. Assigner le procureur général comme gérant
        return this.declarationService.assignGerantToDeclaration(declarationId, procureurGeneral.id);
      })
    )
    .subscribe({
      next: (res) => {
        if (res !== null) {
          this.messageService.add({
            severity: 'success',
            summary: 'Succès',
            detail: 'Déclaration envoyée avec succès.'
          });
          this.loadDeclarations(); // Recharge les déclarations
        }
      },
      error: (err) => {
        console.error('Erreur lors de l\'assignation du gérant :', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Échec lors de l\'envoi de la déclaration.'
        });
      }
    });
}



  hasProcureurGeneralRole(): boolean {
    return this.currentUser?.role?.includes('procureur_general') ?? false;
  }

    hasAvocatGeneralRole(): boolean {
    return this.currentUser?.role?.includes('avocat_general') ?? false;
  }

  toggleSearch(): void {
    this.isSearching = !this.isSearching;
    
    if (!this.isSearching) {
      this.searchQuery = '';
      this.filteredDeclarations = [...this.declarations];
    }
  }
  afficherConclusion(declarationId: number): void {
  this.router.navigate(['/juge', declarationId]);
}

  handleSearch(): void {
    if (!this.searchQuery.trim() && !this.selectedEtat) {
      this.filteredDeclarations = [...this.declarations];
      return;
    }
  
    const keyword = this.searchQuery.toLowerCase();
    
    this.filteredDeclarations = this.declarations.filter(declaration => {
      // Filtre par état si sélectionné
      const etatMatch = !this.selectedEtat || 
                        declaration.etatDeclaration?.toLowerCase() === this.selectedEtat.toLowerCase();
      
      if (!etatMatch) return false;
      if (!this.searchQuery.trim()) return true;
      if (!declaration.assujetti) return false;
      
      // Filtre par nom ou email selon le type de recherche
      if (this.searchType === 'nom') {
        const nom = declaration.assujetti.nom?.toLowerCase() || '';
        const prenom = declaration.assujetti.prenom?.toLowerCase() || '';
        return nom.includes(keyword) || prenom.includes(keyword);
      } else {
        const email = declaration.assujetti.email?.toLowerCase() || '';
        return email.includes(keyword);
      }
    });
  }

  getSelectedDeclarationsEtat(): string | null {
    if (this.selectedDeclarations.length === 0) return null;
    
    const firstEtat = this.selectedDeclarations[0].etatDeclaration;
    const allSameEtat = this.selectedDeclarations.every(d => d.etatDeclaration === firstEtat);
    
    return allSameEtat ? firstEtat : null;
  }

  openChangeManagerDialog(): void {
    const etat = this.getSelectedDeclarationsEtat();
    if (!etat || !(etat === 'en_cours' || etat === 'traitement')) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Attention',
        detail: 'Veuillez sélectionner des déclarations avec état "En cours" ou "En traitement"'
      });
      return;
    }
    this.displayChangeManagerDialog = true;
  }

  envoyerEnTraitement(declarationId: number): void {
  const declaration = this.declarations.find(d => d.id === declarationId);
  
  if (!declaration) {
    this.messageService.add({
      severity: 'error',
      summary: 'Erreur',
      detail: 'Déclaration non trouvée'
    });
    return;
  }
  if (!(declaration.etatDeclaration === 'en_cours' || declaration.etatDeclaration === 'traitement')) {
    this.messageService.add({
      severity: 'warn',
      summary: 'Attention',
      detail: 'La déclaration doit avoir l\'état "En cours" ou "En traitement"'
    });
    return;
  }
  this.selectedDeclarations = [declaration];
  this.displayChangeManagerDialog = true;
}

  assignGerantToSelectedDeclarations(): void {
    if (!this.selectedGerant) return;

    const etat = this.getSelectedDeclarationsEtat();
    if (!etat) return;

    const requests = this.selectedDeclarations.map(decl => {
      if (etat === 'en_cours') {
        return this.declarationService.assignGerantToDeclaration(decl.id, this.selectedGerant!.id);
      } else if (etat === 'traitement') {
        return this.declarationService.assignGerantToDeclaration(decl.id, this.selectedGerant!.id);
      }
      return of(null);
    });

    forkJoin(requests).subscribe(() => {
      this.messageService.add({
        severity: 'success',
        summary: 'Succès',
        detail: etat === 'en_cours' 
          ? 'Conseiller rapporteur affecté avec succès' 
          : 'Avocat général affecté avec succès'
      });
      this.loadDeclarations();
      this.displayChangeManagerDialog = false;
      this.selectedDeclarations = [];
      this.selectedGerant = null;
    });
  }

  /* downloadDeclarationPdf(id: number): void {
    this.declarationService.generatePdf(id).subscribe(
      (response: Blob) => {
        const blob = new Blob([response], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `declaration-${id}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error => console.error('Erreur téléchargement PDF', error)
    );
  } */
    downloadDeclarationPdf(id: number): void {
      this.declarationService.generatePdf(id).subscribe(
        (response: Blob) => {
          const blob = new Blob([response], { type: 'application/pdf' });
          const url = window.URL.createObjectURL(blob);
          
          // Ouvrir le PDF dans une nouvelle fenêtre sans le télécharger
          const newWindow = window.open(url, '_blank');
          if (newWindow) {
            newWindow.focus();
          }
        },
        error => console.error('Erreur lors de la génération du PDF', error)
      );
    }
// Variables

procureursGeneraux: User[] = [];

// Dans ngOnInit ou une méthode d'initialisation
loadProcureursGeneraux() {
  this.utilisateurService.getAllUsers().subscribe(users => {
    this.procureursGeneraux = users
      .filter(u => u.role?.includes('procureur_general') && u.id !== this.currentUser?.id)
      .map(u => ({ 
        ...u, 
        fullName: `${u.firstname} ${u.lastname} (${u.email})` 
      }));
  });
}

// Méthode pour vérifier si le transfert est possible
canTransferDeclarations(): boolean {
  if (this.selectedDeclarations.length === 0) return false;
  
  return this.selectedDeclarations.every(declaration => {
    const etat = declaration.etatDeclaration?.toLowerCase();
    return ['nouveau', 'en_cours', 'traitement', 'jugement','no_declaré'].includes(etat);
  });
}

// Ouvrir le dialogue de transfert
openTransferDialog(): void {
  if (!this.canTransferDeclarations()) {
    this.messageService.add({
      severity: 'warn',
      summary: 'Action impossible',
      detail: 'Veuillez sélectionner des déclarations non finalisées (Nouveau, En cours, En traitement ou En jugement)'
    });
    return;
  }
  this.loadProcureursGeneraux(); // Rafraîchir la liste des PG
  this.displayTransferDialog = true;
}
displayConfirmDialog = false;
transferConfirmationMessage = '';
// Confirmer le transfert
confirmTransfer(): void {
  if (!this.selectedProcureurGeneral || this.selectedDeclarations.length === 0) return;

  // Préparer le message de confirmation
  this.transferConfirmationMessage = `Êtes-vous sûr de vouloir transférer 
    ${this.selectedDeclarations.length} déclaration(s) à 
    ${this.selectedProcureurGeneral.firstname} ${this.selectedProcureurGeneral.lastname} ?`;

  // Afficher la boîte de dialogue de confirmation
  this.displayConfirmDialog = true;
}

// Nouvelle méthode pour exécuter le transfert après confirmation
executeTransfer(): void {
  const declarationIds = this.selectedDeclarations.map(d => d.id);

  this.declarationService.transferDeclarations(
    this.currentUser!.id,
    this.selectedProcureurGeneral!.id,
    declarationIds
  ).subscribe({
    next: (message) => {
      this.messageService.add({
        severity: 'success',
        summary: 'Transfert réussi',
        detail: message || `${this.selectedDeclarations.length} déclaration(s) transférée(s) avec succès`
      });
      this.loadDeclarations();
      this.resetTransferDialog();
    },
    error: (error) => {
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: error.error || error.message || 'Échec du transfert'
      });
    },
    complete: () => {
      this.displayConfirmDialog = false;
    }
  });
}

// Réinitialiser le dialogue
resetTransferDialog(): void {
  this.displayTransferDialog = false;
  this.selectedProcureurGeneral = null;
  this.selectedDeclarations = [];
}
    
    
    
}