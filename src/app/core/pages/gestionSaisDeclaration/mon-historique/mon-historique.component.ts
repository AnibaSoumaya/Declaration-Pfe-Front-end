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
        this.loadHistorique(user.id);
      },
      error: (err) => {
        this.showError('Erreur lors de la récupération des informations utilisateur');
        this.loading = false;
      }
    });
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
    }
  }

  onGlobalFilter(table: Table, event: Event): void {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
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