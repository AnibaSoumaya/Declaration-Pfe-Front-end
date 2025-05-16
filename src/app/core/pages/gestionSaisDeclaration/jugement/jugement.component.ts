import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ConclusionService } from 'src/app/core/services/conclusion.service';
import { MessageService } from 'primeng/api';
import { RapportService } from 'src/app/core/services/rapport.service';
import { UserService } from 'src/app/core/services/user.service';
import { User } from 'src/app/core/models/User.model';
import { Rapport } from 'src/app/core/models/rapport';

@Component({
  selector: 'app-jugement',
  templateUrl: './jugement.component.html',
  styleUrl: './jugement.component.scss',
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

  constructor(
    private route: ActivatedRoute,
    private conclusionService: ConclusionService,
    private rapportService: RapportService,
    private userService: UserService,
    private sanitizer: DomSanitizer,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.declarationId = +this.route.snapshot.params['id'];
    this.loadCurrentUser();
    this.loadPdfs();
    this.loadRapports();
  }

  loadCurrentUser(): void {
    this.userService.getCurrentUser().subscribe({
      next: (user) => {
        this.currentUser = user;
      },
      error: (err) => {
        console.error('Erreur lors du chargement de l\'utilisateur', err);
      }
    });
  }

  loadPdfs(): void {
    this.conclusionService.getByDeclaration(this.declarationId).subscribe({
      next: (conclusions) => {
        if (conclusions.length === 0) {
          this.messageService.add({
            severity: 'warn',
            summary: 'Aucune conclusion',
            detail: 'Aucune conclusion disponible pour cette déclaration'
          });
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
  }

  loadRapports(): void {
    this.rapportService.getByDeclaration(this.declarationId).subscribe({
      next: (rapports) => {
        this.rapports = rapports;
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
          detail: 'Rapport généré avec succès'
        });
      },
      error: (err) => {
        console.error('Erreur lors de la génération du rapport', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de générer le rapport'
        });
      }
    });
  }

  nextPdf(): void {
    if (this.currentPdfIndex < this.pdfUrls.length - 1) {
      this.currentPdfIndex++;
    }
  }

  prevPdf(): void {
    if (this.currentPdfIndex > 0) {
      this.currentPdfIndex--;
    }
  }
  /*
  downloadRapport(rapportId: number, fileName: string): void {
    this.rapportService.telechargerRapport(rapportId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      },
      error: (err) => {
        console.error('Erreur lors du téléchargement du rapport', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de télécharger le rapport'
        });
      }
    });
  }*/

    downloadRapport(rapportId: number, fileName: string): void {
  this.rapportService.telecharger(rapportId)
    .subscribe({
      next: (response: Blob) => {
        const blob = new Blob([response], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        
        // Ouvrir le PDF dans une nouvelle fenêtre
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
}