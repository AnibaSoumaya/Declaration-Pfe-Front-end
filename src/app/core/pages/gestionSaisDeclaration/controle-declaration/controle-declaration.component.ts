import { Component, Input, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { DeclarationService } from 'src/app/core/services/declaration.service';
import { CommentaireGeneriqueService } from 'src/app/core/services/commentaire-generique.service';
import { CommentaireGenerique } from 'src/app/core/models/CommentaireGenerique';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Declaration } from 'src/app/core/models/declaration';
import { User } from 'src/app/core/models/User.model';
import { UserService } from 'src/app/core/services/user.service';
import { ConclusionService } from 'src/app/core/services/conclusion.service';
import { MessageService } from 'primeng/api';
import { of, switchMap } from 'rxjs';

@Component({
  selector: 'app-controle-declaration',
  templateUrl: './controle-declaration.component.html',
  styleUrls: ['./controle-declaration.component.scss'],
  providers: [MessageService]
})
export class ControleDeclarationComponent implements OnInit {
  
  @Input() declarationId: number;
  declaration: Declaration;
  loading = true;
  error = false;

  showPredictionDialog = false;
  predictionRemark = '';
  pendingPdfBlob: Blob | null = null;

  isAvocatGeneral = false;
  conclusions: any[] = [];
  newLettreContent = '';
  selectedFile: File | null = null;

  commentaires: { [key: string]: CommentaireGenerique[] } = {};
  showComments: { [key: string]: boolean } = {};
  expandedSections: { [key: string]: boolean } = {
    'Vehicule': false,
    'Revenus': false,
    'FoncierBati': false,
    'FoncierNonBati': false,
    'Emprunts': false,
    'DisponibilitesEnBanque': false,
    'Especes': false,
    'Animaux': false,
    'MeublesMeublants': false,
    'Titres': false,
    'LesCreances': false,
    'AutresDettes': false,
    'AutresBiensDeValeur': false,
    'AppareilsElectroMenagers': false
  };

  commentForm: FormGroup;
  currentSection: string = '';
  currentUser: User;
  isGeneratingReport = false;
  requisitoireType: 'acceptation' | 'refus' | null = null;
  formSubmitted: boolean = false;
  showGenerationForm: boolean = false;
  


  constructor(
    private declarationService: DeclarationService,
    private commentaireService: CommentaireGeneriqueService,
    private conclusionService: ConclusionService,
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private messageService: MessageService,

  ) {
    this.createCommentForm();
  }

  ngOnInit(): void {
    this.loadCurrentUserAndData();
  }

  get hasExistingConclusion(): boolean {
  return this.conclusions && this.conclusions.length > 0;
}

  

  loadCurrentUserAndData(): void {
    this.userService.getCurrentUser().subscribe({
      next: (user) => {
        this.currentUser = user;
        this.isAvocatGeneral = this.currentUser.role.includes('avocat_general');
        
        this.resolveDeclarationId().then(() => {
          this.loadDeclaration();
          if (this.isAvocatGeneral) {
            this.loadConclusions(); // Charger les conclusions dès le début
          }
        });
      },
      error: (error) => {
        console.error("Erreur lors de la récupération de l'utilisateur connecté", error);
        this.error = true;
        this.loading = false;
      }
    });
  }

  resolveDeclarationId(): Promise<void> {
    return new Promise((resolve) => {
      if (this.declarationId) {
        resolve();
      } else {
        this.route.params.subscribe(params => {
          if (params['id']) {
            this.declarationId = +params['id'];
            resolve();
          }
        });
      }
    });
  }


  envoyerDeclaration(): void {
  // Vérification de l'ID
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

  // 1. Récupérer le conseiller rapporteur pour cette déclaration
  this.declarationService.getFirstUtilisateurByRoleAndDeclaration(this.declarationId, 'procureur_general')
    .pipe(
      switchMap(procureurGeneral => {
        console.log('procureur general récupéré :', procureurGeneral);

        if (!procureurGeneral) {
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: 'Aucun procureur general trouvé pour cette déclaration.'
          });
          return of(null);
        }

        // 2. Assigner le procureur General comme gérant
        return this.declarationService.assignGerantToDeclaration(this.declarationId, procureurGeneral.id);
      })
    )
    .subscribe({
      next: (res) => {
        if (res !== null) {
          this.messageService.add({
            severity: 'success',
            summary: 'Succès',
            detail: 'Déclaration envoyée au procureur General avec succès.',
            life: 2000
          });
          setTimeout(() => {
            this.router.navigate(['/Assujetti/decDetails']);
          }, 2000);
        }
      },
      error: (err) => {
        console.error('Erreur lors de l\'assignation :', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Échec lors de l\'envoi de la déclaration.'
        });
      }
    });
}

  createCommentForm(): void {
    this.commentForm = this.fb.group({
      commentaire: ['', Validators.required]
    });
  }

  loadDeclaration(): void {
    if (!this.declarationId) return;

    this.loading = true;
    this.declarationService.getDeclarationDetails(this.declarationId)
      .subscribe({
        next: (data) => {
          this.declaration = data;
          this.loading = false;
        },
        error: (error) => {
          console.error('Erreur lors du chargement de la déclaration', error);
          this.error = true;
          this.loading = false;
        }
      });
  }

  loadConclusions(): void {
    if (!this.declarationId) return;

    this.conclusionService.getByDeclaration(this.declarationId)
      .subscribe({
        next: (conclusions) => {
          this.conclusions = conclusions || [];
          console.log('Conclusions chargées:', this.conclusions); // Debug
        },
        error: (err) => {
          console.error('Erreur lors du chargement des conclusions', err);
        }
      });
  }

  toggleSection(section: string): void {
    const isExpanded = this.expandedSections[section] = !this.expandedSections[section];
    if (isExpanded) {
      this.showComments[section] = this.showComments[section] ?? true;
    } else {
      this.showComments[section] = false;
    }
  }

  isSectionExpanded(section: string): boolean {
    return this.expandedSections[section];
  }

  onCommentAdded(comment: CommentaireGenerique, section: string): void {
    if (!this.commentaires[section]) {
      this.commentaires[section] = [];
    }
    this.commentaires[section].push(comment);
  }

  onCommentDeleted(commentId: number, section: string): void {
    if (this.commentaires[section]) {
      this.commentaires[section] = this.commentaires[section].filter(c => c.id !== commentId);
    }
  }

  printDeclaration(): void {
    this.declarationService.generatePdf(this.declarationId)
      .subscribe({
        next: (response: any) => {
          const file = new Blob([response], { type: 'application/pdf' });
          const fileURL = URL.createObjectURL(file);
          window.open(fileURL);
        },
        error: (error) => {
          console.error('Erreur lors de la génération du PDF', error);
        }
      });
  }

  goBack(): void {
    this.router.navigate(['/Assujetti/decDetails']);
  }

  formatDate(date: string | Date): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('fr-FR');
  }

  formatNumber(value: number): string {
    if (value === undefined || value === null) return 'N/A';
    return new Intl.NumberFormat('fr-FR').format(value);
  }

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
  }

  deleteConclusion(conclusionId: number, index: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette conclusion ?')) {
      this.conclusionService.deleteConclusion(conclusionId).subscribe({
        next: () => {
          this.conclusions.splice(index, 1);
        },
        error: (err) => {
          console.error('Erreur lors de la suppression', err);
        }
      });
    }
  }

  resetForm(): void {
  this.requisitoireType = null;
  this.newLettreContent = '';
  this.formSubmitted = false;
  this.showGenerationForm = false;
}
genererLettre(): void {
  this.formSubmitted = true;

  // Validation minimale
  if (!this.requisitoireType) {
    this.messageService.add({
      severity: 'warn', 
      summary: 'Action requise',
      detail: 'Veuillez sélectionner le type de réquisitoire',
      life: 5000
    });
    return;
  }

  if (!this.newLettreContent) {
    this.messageService.add({
      severity: 'warn',
      summary: 'Contenu vide',
      detail: 'Veuillez rédiger le contenu de la lettre',
      life: 5000
    });
    return;
  }

  if (!this.declarationId || !this.currentUser?.id) {
    this.messageService.add({
      severity: 'error',
      summary: 'Erreur système',
      detail: 'Données manquantes',
      life: 5000
    });
    return;
  }

  const estAcceptation = this.requisitoireType === 'acceptation';

  this.conclusionService.genererLettreOfficielle(
    this.currentUser.id,
    this.declarationId,
    this.newLettreContent,
    estAcceptation
  ).subscribe({
    next: () => {
      this.messageService.add({
        severity: 'success',
        summary: 'Opération réussie',
        detail: `Lettre officielle générée (${this.requisitoireType})`,
        life: 3000
      });

      this.resetForm();
      this.loadConclusions();
    },
    error: (err) => {
      console.error('Erreur', err);
      this.messageService.add({
        severity: 'error',
        summary: 'Échec de génération',
        detail: err.error?.message || 'Erreur inattendue',
        life: 5000
      });
    }
  });
}

  downloadConclusion(conclusionId: number, fileName: string): void {
  this.conclusionService.telechargerConclusion(conclusionId)
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

// Méthode pour générer le rapport de prédiction pour les fonciers bâtis
generatePredictionReportFB(): void {
  if (!this.declarationId) return;

  this.isGeneratingReport = true;
  
  this.declarationService.generatePredictionReportFB(this.declarationId).subscribe({
    next: (pdfBlob: Blob) => {
      this.handlePdfDownload(pdfBlob);
      this.isGeneratingReport = false;
    },
    error: (error) => {
      console.error('Erreur lors de la génération du rapport', error);
      this.isGeneratingReport = false;
      // Ajoutez ici une notification à l'utilisateur si nécessaire
    }
  });
}

generatePredictionReportVH(): void {
  if (!this.declarationId) return;

  this.isGeneratingReport = true;
  
  this.declarationService.generatePredictionReportVH(this.declarationId).subscribe({
    next: (pdfBlob: Blob) => {
      this.handlePdfDownload(pdfBlob);
      this.isGeneratingReport = false;
    },
    error: (error) => {
      console.error('Erreur lors de la génération du rapport', error);
      this.isGeneratingReport = false;
      // Ajoutez ici une notification à l'utilisateur si nécessaire
    }
  });
}


// Ajoutez cette méthode à votre classe
generatePredictionReport(): void {
  if (!this.declarationId) return;

  this.isGeneratingReport = true;
  
  this.declarationService.generatePredictionReport(this.declarationId).subscribe({
    next: (pdfBlob: Blob) => {
      this.handlePdfDownload(pdfBlob);
      this.isGeneratingReport = false;
    },
    error: (error) => {
      console.error('Erreur lors de la génération du rapport', error);
      this.isGeneratingReport = false;
      // Vous pouvez ajouter une notification à l'utilisateur ici
    }
  });
}

private handlePdfDownload(blob: Blob): void {
  // Solution compatible avec tous les navigateurs
  const nav = window.navigator as any; // Assertion de type
  
  if (nav.msSaveOrOpenBlob) {
    // Pour IE
    nav.msSaveOrOpenBlob(blob, `rapport_prediction_${this.declarationId}.pdf`);
  } else {
    // Pour les autres navigateurs
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `rapport_prediction_${this.declarationId}_${new Date().toISOString().slice(0,10)}.pdf`;
    document.body.appendChild(link);
    link.click();
    
    // Nettoyage
    setTimeout(() => {
      window.URL.revokeObjectURL(url);
      link.remove();
    }, 100);
  }
}
}