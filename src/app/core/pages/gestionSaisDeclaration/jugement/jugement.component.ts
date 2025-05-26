import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ConclusionService } from 'src/app/core/services/conclusion.service';
import { MessageService } from 'primeng/api';
import { RapportService } from 'src/app/core/services/rapport.service';
import { UserService } from 'src/app/core/services/user.service';
import { User } from 'src/app/core/models/User.model';
import { Rapport } from 'src/app/core/models/rapport';
import { DeclarationService } from 'src/app/core/services/declaration.service';
import { switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-jugement',
  templateUrl: './jugement.component.html',
  styleUrls: ['./jugement.component.scss'],
  providers: [MessageService]
})
export class JugementComponent implements OnInit {
  declarationId!: number;
  pdfUrls: SafeResourceUrl[] = [];
  currentPdfIndex = 0;
  isLoading = true;
  currentUser!: User;
  rapports: Rapport[] = [];
  newRapportContent = '';
  showRapportForm = false;
  decision: boolean | null = null;
  activeTab: 'conclusion' | 'rapport' = 'conclusion';
  rapportPdfUrls: SafeResourceUrl[] = [];
  // Ajoutez cette propriété
showPdfViewer: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private conclusionService: ConclusionService,
    private rapportService: RapportService,
    private userService: UserService,
    private sanitizer: DomSanitizer,
    private declarationService: DeclarationService, // Ajoutez ce service
    private router: Router,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.declarationId = +this.route.snapshot.params['id'];
    this.loadCurrentUser();
    this.loadPdfs();
    this.loadRapports();
  }

  setDecision(value: boolean): void {
  this.decision = value;
}
  loadCurrentUser(): void {
    this.userService.getCurrentUser().subscribe({
      next: (user) => {
        this.currentUser = user;
        // Charger seulement les rapports pertinents pour le rôle
        this.loadRapports();
      },
      error: (err) => {
        console.error('Erreur lors du chargement de l\'utilisateur', err);
      }
    });
  }
  // Méthodes
openPdfViewer(tab: 'conclusion' | 'rapport'): void {
  this.activeTab = tab;
  this.showPdfViewer = true;
  // Réinitialiser la navigation si besoin
  this.currentPdfIndex = 0; 
}

closePdfViewer(): void {
  this.showPdfViewer = false;
}
  goBack(): void {
    this.router.navigate(['/Assujetti/decDetails']);
  }

loadPdfs(): void {
    // Chargement des conclusions (comme avant)
    this.conclusionService.getByDeclaration(this.declarationId).subscribe({
      next: (conclusions) => {
        if (conclusions.length === 0) {
          this.isLoading = false;
          return;
        }

        conclusions.forEach((conclusion, index) => {
          this.conclusionService.telechargerConclusion(conclusion.id).subscribe({
            next: (blob) => {
              const url = URL.createObjectURL(blob);
              this.pdfUrls.push(this.sanitizer.bypassSecurityTrustResourceUrl(url));

              if (index === conclusions.length - 1) {
                this.isLoading = false;
              }
            },
            error: (err) => {
              console.error('Erreur lors du chargement du PDF', err);
              this.isLoading = false;
              this.messageService.add({
                severity: 'error',
                summary: 'Erreur',
                detail: 'Impossible de charger le PDF'
              });
            }
          });
        });
      },
      error: (err) => {
        console.error('Erreur lors du chargement des conclusions', err);
        this.isLoading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de charger les conclusions'
        });
      }
    });

    // Chargement des rapports PDF (nouveau)
    this.loadRapportPdfs();
}
loadRapportPdfs(): void {
    this.rapportService.getByDeclaration(this.declarationId).subscribe({
      next: (rapports) => {
        const provisoireRapports = rapports.filter(r => r.type === 'PROVISOIRE');
        
        provisoireRapports.forEach(rapport => {
          this.rapportService.telecharger(rapport.id).subscribe({
            next: (blob) => {
              const url = URL.createObjectURL(blob);
              this.rapportPdfUrls.push(this.sanitizer.bypassSecurityTrustResourceUrl(url));
            },
            error: (err) => {
              console.error('Erreur lors du chargement du rapport PDF', err);
            }
          });
        });
      },
      error: (err) => {
        console.error('Erreur lors du chargement des rapports', err);
      }
    });
}
getCurrentPdfUrls(): SafeResourceUrl[] {
    return this.activeTab === 'conclusion' ? this.pdfUrls : this.rapportPdfUrls;
}
changeTab(tab: 'conclusion' | 'rapport'): void {
    this.activeTab = tab;
    this.currentPdfIndex = 0; // Réinitialise l'index quand on change d'onglet
}
  loadRapports(): void {
    if (!this.currentUser) return;

    // Filtrer par type selon le rôle
    const type = this.currentUser.role === 'procureur_general' ? 'DEFINITIF' : 'PROVISOIRE';
    
    this.rapportService.getByDeclaration(this.declarationId).subscribe({
      next: (rapports) => {
        this.rapports = rapports.filter(r => r.type === type);
      },
      error: (err) => {
        console.error('Erreur lors du chargement des rapports', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de charger les rapports'
        });
      }
    });
  }

  hasExistingRapport(): boolean {
    if (!this.currentUser) return false;
    
    const expectedType = this.currentUser.role === 'procureur_general' ? 'DEFINITIF' : 'PROVISOIRE';
    return this.rapports.some(r => r.type === expectedType);
  }

  genererRapportDefinitif(): void {
    if (this.decision === null || !this.newRapportContent) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Attention',
        detail: 'Veuillez sélectionner une décision et rédiger le rapport'
      });
      return;
    }

    this.rapportService.genererDefinitif(
      this.currentUser.id,
      this.declarationId,
      this.decision,
      this.newRapportContent
    ).subscribe({
      next: (rapport) => {
        this.rapports.unshift(rapport);
        this.showRapportForm = false;
        this.newRapportContent = '';
        this.decision = null;
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Rapport définitif généré avec succès'
        });
      },
      error: (err) => {
        console.error('Erreur lors de la génération du rapport', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de générer le rapport définitif'
        });
      }
    });
  }

  genererRapportProvisoire(): void {
    if (!this.newRapportContent) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Attention',
        detail: 'Veuillez rédiger le rapport'
      });
      return;
    }

    this.rapportService.genererProvisoire(
      this.currentUser.id,
      this.declarationId,
      this.newRapportContent
    ).subscribe({
      next: (rapport) => {
        this.rapports.unshift(rapport);
        this.showRapportForm = false;
        this.newRapportContent = '';
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Rapport provisoire généré avec succès'
        });
      },
      error: (err) => {
        console.error('Erreur lors de la génération du rapport', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de générer le rapport provisoire'
        });
      }
    });
  }

nextPdf(): void {
    if (this.currentPdfIndex < this.getCurrentPdfUrls().length - 1) {
      this.currentPdfIndex++;
    }
}

  prevPdf(): void {
    if (this.currentPdfIndex > 0) {
      this.currentPdfIndex--;
    }
  }

  downloadRapport(rapportId: number, fileName: string): void {
    this.rapportService.telecharger(rapportId).subscribe({
      next: (response: Blob) => {
        const blob = new Blob([response], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const newWindow = window.open(url, '_blank');
        if (newWindow) {
          newWindow.focus();
        }
      },
      error: (err) => {
        console.error('Erreur lors du téléchargement', err);
      }
    });
  }

  deleteRapport(rapportId: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce rapport ?')) {
      this.rapportService.delete(rapportId).subscribe({
        next: () => {
          this.rapports = this.rapports.filter(r => r.id !== rapportId);
          this.messageService.add({
            severity: 'success',
            summary: 'Succès',
            detail: 'Rapport supprimé avec succès'
          });
        },
        error: (err) => {
          console.error('Erreur lors de la suppression du rapport', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: 'Impossible de supprimer le rapport'
          });
        }
      });
    }
  }
  
  formatDate(dateString: string): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Ajoutez cette méthode pour vérifier s'il y a des rapports provisoires
hasRapportsProvisoires(): boolean {
  return this.rapports.some(r => r.type === 'PROVISOIRE');
}

// Méthode pour envoyer au Procureur Général
envoyerAuProcureurGeneral(): void {
  if (typeof this.declarationId !== 'number') {
    console.error('ID de déclaration invalide :', this.declarationId);
    this.messageService.add({
      severity: 'error',
      summary: 'Erreur',
      detail: 'Identifiant de déclaration invalide.'
    });
    return;
  }

  console.log('Début de l\'envoi pour la déclaration ID:', this.declarationId);

  // 1. Récupérer le procureur général pour cette déclaration
  this.declarationService.getFirstUtilisateurByRoleAndDeclaration(this.declarationId, 'procureur_general')
    .pipe(
      switchMap(procureurGeneral => {
        console.log('Procureur général récupéré :', procureurGeneral);

        if (!procureurGeneral) {
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: 'Aucun procureur général trouvé pour cette déclaration.'
          });
          return of(null);
        }

        // 2. Assigner le procureur général comme gérant
        return this.declarationService.assignGerantToDeclaration(this.declarationId, procureurGeneral.id);
      })
    )
    .subscribe({
      next: (res) => {
        if (res !== null) {
          this.messageService.add({
            severity: 'success',
            summary: 'Succès',
            detail: 'Rapports provisoires envoyés au procureur général avec succès.',
            life: 2000
          });
          setTimeout(() => {
            this.router.navigate(['/Assujetti/decDetails']); // Adaptez la route selon vos besoins
          }, 2000);
        }
      },
      error: (err) => {
        console.error('Erreur lors de l\'assignation :', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Échec lors de l\'envoi des rapports provisoires.'
        });
      }
    });
}
}