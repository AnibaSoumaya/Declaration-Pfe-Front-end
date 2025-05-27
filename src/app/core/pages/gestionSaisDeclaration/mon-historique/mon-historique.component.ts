import { Component, OnInit, ViewChild } from '@angular/core';
import { HistoriqueDeclarationUser } from 'src/app/core/models/HistoriqueDeclarationUser';
import { User } from 'src/app/core/models/User.model';
import { DeclarationService } from 'src/app/core/services/declaration.service';
import { UserService } from 'src/app/core/services/user.service';
import { MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { OverlayPanel } from 'primeng/overlaypanel';
import { Rapport } from 'src/app/core/models/rapport';
import { RapportService } from 'src/app/core/services/rapport.service';
import { ConclusionService } from 'src/app/core/services/conclusion.service';
import { forkJoin } from 'rxjs';

interface FilterOption {
  label: string;
  value: string;
  field: string;
}

@Component({
  selector: 'app-mon-historique',
  templateUrl: './mon-historique.component.html',
  styleUrls: ['./mon-historique.component.scss'],
  providers: [MessageService]
})
export class MonHistoriqueComponent implements OnInit {
  @ViewChild('rapportPanel') rapportPanel!: OverlayPanel;
  
  historique: HistoriqueDeclarationUser[] = [];
  loading = true;
  isSearching = false;
  searchQuery = '';
  rapports: Rapport[] = [];
  conclusions: any[] = [];
  selectedDeclarationId: number | null = null;
  loadingRapports = false;
  currentUser: User | null = null;
  showResponsibleColumn = false;

  // Nouvelles propriétés pour le filtrage avancé
  selectedFilterType: string = 'global';
  filterOptions: FilterOption[] = [
    { label: 'Recherche globale', value: 'global', field: '' },
    { label: 'Par N° Déclaration', value: 'id', field: 'declaration.id' },
    { label: 'Par Assujetti', value: 'assujetti', field: 'declaration.assujetti' },
    { label: 'Par Responsable', value: 'responsable', field: 'declaration.utilisateur' },
    { label: 'Par Date d\'affectation', value: 'dateAffectation', field: 'dateAffectation' }
  ];

  constructor(
    private declarationService: DeclarationService,
    private userService: UserService,
    private messageService: MessageService,
    private rapportService: RapportService,
    private conclusionService: ConclusionService
  ) {}

  ngOnInit(): void {
    this.loadCurrentUserAndHistorique();
  }

  loadCurrentUserAndHistorique(): void {
    this.userService.getCurrentUser().subscribe({
      next: (user) => {
        this.currentUser = user;
        this.showResponsibleColumn = this.hasAdminRole();
        
        // Ajuster les options de filtre selon le rôle
        if (!this.hasAdminRole()) {
          this.filterOptions = this.filterOptions.filter(option => option.value !== 'responsable');
        }
        
        if (this.hasAdminRole()) {
          this.loadAllHistorique();
        } else {
          this.loadHistorique(user.id);
        }
      },
      error: (err) => {
        this.showError('Erreur lors de la récupération des informations utilisateur');
        this.loading = false;
      }
    });
  }

  loadAllHistorique(): void {
    this.declarationService.getAllHistoriques().subscribe({
      next: (data) => {
        this.historique = data;
        this.loading = false;
      },
      error: (err) => {
        this.showError('Erreur lors du chargement de l\'historique complet');
        this.loading = false;
      }
    });
  }

  hasAdminRole(): boolean {
    return this.currentUser?.role === 'administrateur';
  }

  loadHistorique(userId: number): void {
    this.declarationService.getHistoriqueByUtilisateur(userId).subscribe({
      next: (data) => {
        this.historique = data;
        this.loading = false;
      },
      error: (err) => {
        this.showError('Erreur lors du chargement de l\'historique');
        this.loading = false;
      }
    });
  }

  // Fonction appelée au clic sur le bouton rapport
  onRapportButtonClick(event: Event, declarationId: number): void {
    event.stopPropagation();
    this.selectedDeclarationId = declarationId;
    this.loadingRapports = true;
    this.rapports = [];
    this.conclusions = [];
    
    // Afficher le panel immédiatement
    this.rapportPanel.toggle(event);
    
    // Charger les rapports et conclusions en parallèle
    forkJoin({
      rapports: this.rapportService.getByDeclaration(declarationId),
      conclusions: this.conclusionService.getByDeclaration(declarationId)
    }).subscribe({
      next: (result) => {
        this.rapports = result.rapports;
        this.conclusions = result.conclusions;
        this.loadingRapports = false;
        console.log('Rapports chargés:', result.rapports);
        console.log('Conclusions chargées:', result.conclusions);
      },
      error: (err) => {
        this.showError('Erreur lors du chargement des documents');
        this.rapports = [];
        this.conclusions = [];
        this.loadingRapports = false;
      }
    });
  }

  // Vérifier si un type de rapport existe
  hasRapportType(type: string): boolean {
    return this.rapports.some(r => r.type === type);
  }

  // Vérifier si des conclusions existent
  hasConclusions(): boolean {
    return this.conclusions.length > 0;
  }

  // Afficher un rapport par type dans un nouvel onglet
  viewRapportByType(type: string): void {
    const rapport = this.rapports.find(r => r.type === type);
    if (rapport) {
      this.viewRapport(rapport.id);
      this.rapportPanel.hide();
    }
  }

  // Afficher une conclusion dans un nouvel onglet
  viewConclusion(conclusionId: number): void {
    this.conclusionService.telechargerConclusion(conclusionId).subscribe({
      next: (response: Blob) => {
        const blob = new Blob([response], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        
        // Ouvrir le PDF dans un nouvel onglet
        const newTab = window.open(url, '_blank');
        if (newTab) {
          newTab.focus();
        }
        
        this.rapportPanel.hide();
      },
      error: (err) => {
        this.showError('Erreur lors de l\'ouverture de la conclusion');
      }
    });
  }

  // Afficher la déclaration PDF dans un nouvel onglet
  viewDeclarationPdf(): void {
    if (this.selectedDeclarationId) {
      this.declarationService.generatePdf(this.selectedDeclarationId).subscribe({
        next: (response: Blob) => {
          const blob = new Blob([response], { type: 'application/pdf' });
          const url = window.URL.createObjectURL(blob);
          
          // Ouvrir le PDF dans un nouvel onglet
          const newTab = window.open(url, '_blank');
          if (newTab) {
            newTab.focus();
          }
          
          this.rapportPanel.hide();
        },
        error: (err) => {
          this.showError('Erreur lors de l\'ouverture de la déclaration PDF');
        }
      });
    }
  }

  viewRapport(rapportId: number): void {
    this.rapportService.telecharger(rapportId).subscribe({
      next: (response: Blob) => {
        const blob = new Blob([response], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        
        // Ouvrir le PDF dans un nouvel onglet
        const newTab = window.open(url, '_blank');
        if (newTab) {
          newTab.focus();
        }
      },
      error: (err) => {
        this.showError('Erreur lors de l\'ouverture du rapport');
      }
    });
  }

  toggleSearch(): void {
    this.isSearching = !this.isSearching;
    if (!this.isSearching) {
      this.searchQuery = '';
      this.selectedFilterType = 'global';
    }
  }

  // Nouvelle fonction pour gérer le filtrage selon le type sélectionné
  onGlobalFilter(table: Table, event: Event): void {
    const searchValue = (event.target as HTMLInputElement).value;
    
    if (this.selectedFilterType === 'global') {
      // Recherche globale sur tous les champs
      table.filterGlobal(searchValue, 'contains');
    } else {
      // Effacer tous les filtres existants
      table.clear();
      
      if (!searchValue.trim()) {
        return; // Si la recherche est vide, ne pas appliquer de filtre
      }
      
      // Recherche spécifique selon le type de filtre
      if (this.selectedFilterType === 'assujetti') {
        // Filtrage personnalisé pour assujetti
        this.applyCustomFilter(table, searchValue, 'assujetti');
      } else if (this.selectedFilterType === 'responsable') {
        // Filtrage personnalisé pour responsable
        this.applyCustomFilter(table, searchValue, 'responsable');
      } else if (this.selectedFilterType === 'dateAffectation') {
        // Filtrage par date
        table.filter(searchValue, 'dateAffectation', 'contains');
      } else if (this.selectedFilterType === 'id') {
        // Filtrage par ID de déclaration
        table.filter(searchValue, 'declaration.id', 'contains');
      }
    }
  }

  // Fonction pour appliquer un filtrage personnalisé (assujetti ou responsable)
  private applyCustomFilter(table: Table, searchValue: string, type: 'assujetti' | 'responsable'): void {
    const normalizedSearch = this.normalizeString(searchValue);
    
    // Filtrer manuellement les données
    const filteredData = this.historique.filter(item => {
      let fullName = '';
      
      if (type === 'assujetti' && item.declaration.assujetti) {
        const prenom = item.declaration.assujetti.prenom || '';
        const nom = item.declaration.assujetti.nom || '';
        fullName = `${prenom} ${nom}`.trim();
      } else if (type === 'responsable' && item.declaration.utilisateur) {
        const firstname = item.declaration.utilisateur.firstname || '';
        const lastname = item.declaration.utilisateur.lastname || '';
        fullName = `${firstname} ${lastname}`.trim();
      }
      
      const normalizedFullName = this.normalizeString(fullName);
      
      // Recherche dans le nom complet ou dans chaque partie séparément
      return normalizedFullName.includes(normalizedSearch) ||
             normalizedFullName.split(' ').some(part => part.includes(normalizedSearch));
    });
    
    // Appliquer le filtre personnalisé
    table.value = filteredData;
  }

  // Fonction pour normaliser les chaînes (supprimer accents, espaces multiples, majuscules)
  private normalizeString(str: string): string {
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Supprimer les accents
      .replace(/\s+/g, ' ') // Remplacer les espaces multiples par un seul
      .trim();
  }

  // Fonction pour changer le type de filtre
  onFilterTypeChange(): void {
    // Réinitialiser la recherche quand on change de type de filtre
    this.searchQuery = '';
    // Remettre les données originales dans le tableau
    if (this.selectedFilterType === 'global') {
      // Recharger les données originales si on revient à la recherche globale
      this.resetTableData();
    }
  }

  // Fonction pour remettre les données originales dans le tableau
  private resetTableData(): void {
    // Cette fonction sera appelée automatiquement quand searchQuery sera vide
  }

  // Fonction pour obtenir le placeholder selon le type de filtre sélectionné
  getSearchPlaceholder(): string {
    const filterOption = this.filterOptions.find(opt => opt.value === this.selectedFilterType);
    
    switch (this.selectedFilterType) {
      case 'global':
        return 'Rechercher dans tous les champs...';
      case 'id':
        return 'Rechercher par N° de déclaration...';
      case 'assujetti':
        return 'Rechercher par nom d\'assujetti...';
      case 'responsable':
        return 'Rechercher par nom de responsable...';
      case 'dateAffectation':
        return 'Rechercher par date (dd/mm/yyyy)...';
      default:
        return 'Rechercher...';
    }
  }

  private showError(message: string): void {
    this.messageService.add({
      severity: 'error',
      summary: 'Erreur',
      detail: message,
      life: 5000
    });
  }
}