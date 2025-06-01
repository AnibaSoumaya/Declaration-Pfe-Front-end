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
import { Vehicule } from 'src/app/core/models/vehicule';
import { Animaux } from 'src/app/core/models/animaux';
import { AppareilElectroMenager } from 'src/app/core/models/appareilElectroMenager';
import { AutreBienDeValeur } from 'src/app/core/models/autreBienDeValeur';
import { AutreDette } from 'src/app/core/models/autreDette';
import { DisponibiliteEnBanque } from 'src/app/core/models/disponibiliteEnBanque';
import { Emprunt } from 'src/app/core/models/emprunt';
import { Espece } from 'src/app/core/models/espece';
import { FoncierBati } from 'src/app/core/models/foncierBati';
import { FoncierNonBati } from 'src/app/core/models/foncierNonBati';
import { Creance } from 'src/app/core/models/creance';
import { MeubleMeublant } from 'src/app/core/models/meubleMeublant';
import { Revenu } from 'src/app/core/models/revenu';
import { Titre } from 'src/app/core/models/titre';
import { PredictionResult } from 'src/app/core/models/PredictionResult';

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

foncierNonBatiPredictions: PredictionResult[] = [];
showNonBatiPredictions = false;

vehiculePredictions: PredictionResult[] = [];
showVehiculePredictions = false;

foncierBatiPredictions: PredictionResult[] = [];
showPredictions = false;

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

  // Méthodes pour les prédictions véhicules
toggleVehiculePredictions(): void {
  if (!this.showVehiculePredictions && this.vehiculePredictions.length === 0) {
    this.loadVehiculePredictions();
  } else {
    this.showVehiculePredictions = !this.showVehiculePredictions;
  }
}

loadVehiculePredictions(): void {
  this.isGeneratingReport = true;
  this.declarationService.getPredictionsForDeclarationvh(this.declarationId).subscribe({
    next: (results) => {
      this.vehiculePredictions = results;
      this.showVehiculePredictions = true;
      this.isGeneratingReport = false;
    },
    error: (error) => {
      console.error('Erreur lors du chargement des prédictions', error);
      this.isGeneratingReport = false;
    }
  });
}

getVehiculePredictionValue(vehicule: Vehicule): number {
  const prediction = this.vehiculePredictions.find(p => p.vehicule.id === vehicule.id);
  return prediction?.prediction || 0;
}

getVehiculeEcartPercentage(vehicule: Vehicule): number {
  const declared = vehicule.valeurAcquisition;
  const predicted = this.getVehiculePredictionValue(vehicule);
  if (!declared || !predicted) return 0;
  return (Math.abs(declared - predicted) / declared) * 100;
}

getVehiculeEcartClass(vehicule: Vehicule): string {
  const ecart = this.getVehiculeEcartPercentage(vehicule);
  if (ecart > 20) return 'high';
  if (ecart > 10) return 'medium';
  return 'low';
}


toggleNonBatiPredictions(): void {
  if (!this.showNonBatiPredictions && this.foncierNonBatiPredictions.length === 0) {
    this.loadNonBatiPredictions();
  } else {
    this.showNonBatiPredictions = !this.showNonBatiPredictions;
  }
}

loadNonBatiPredictions(): void {
  this.isGeneratingReport = true;
  this.declarationService.getPredictionsForDeclarationfnb(this.declarationId).subscribe({
    next: (results) => {
      this.foncierNonBatiPredictions = results;
      this.showNonBatiPredictions = true;
      this.isGeneratingReport = false;
    },
    error: (error) => {
      console.error('Erreur lors du chargement des prédictions', error);
      this.isGeneratingReport = false;
    }
  });
}

getNonBatiPredictionValue(foncier: FoncierNonBati): number {
  const prediction = this.foncierNonBatiPredictions.find(p => p.foncierNonBati.id === foncier.id);
  return prediction?.prediction || 0;
}

getNonBatiEcartPercentage(foncier: FoncierNonBati): number {
  const declared = foncier.valeurAcquisFCFA;
  const predicted = this.getNonBatiPredictionValue(foncier);
  if (!declared || !predicted) return 0;
  return (Math.abs(declared - predicted) / declared) * 100;
}

getNonBatiEcartClass(foncier: FoncierNonBati): string {
  const ecart = this.getNonBatiEcartPercentage(foncier);
  if (ecart > 20) return 'high';
  if (ecart > 10) return 'medium';
  return 'low';
}

  // Ajoutez ces méthodes
togglePredictions(): void {
  if (!this.showPredictions && this.foncierBatiPredictions.length === 0) {
    this.loadPredictions();
  } else {
    this.showPredictions = !this.showPredictions;
  }
}

loadPredictions(): void {
  this.isGeneratingReport = true;
  this.declarationService.getPredictionsForDeclaration(this.declarationId).subscribe({
    next: (results) => {
      this.foncierBatiPredictions = results;
      this.showPredictions = true;
      this.isGeneratingReport = false;
    },
    error: (error) => {
      console.error('Erreur lors du chargement des prédictions', error);
      this.isGeneratingReport = false;
    }
  });
}



getPredictionValue(foncier: any): number {
  const prediction = this.foncierBatiPredictions.find(p => p.foncierBati.id === foncier.id);
  return prediction?.prediction || 0;
}

getEcartPercentage(foncier: any): number {
  const declared = foncier.coutAcquisitionFCFA;
  const predicted = this.getPredictionValue(foncier);
  if (!declared || !predicted) return 0;
  return (Math.abs(declared - predicted) / declared) * 100;
}


getEcartClass(foncier: any): string {
  const ecart = this.getEcartPercentage(foncier);
  if (ecart > 20) return 'high';
  if (ecart > 10) return 'medium';
  return 'low'; // Cette ligne sera exécutée pour ecart <= 10
}
  showPredictionsFB(): void {
  if (!this.declarationId) return;

  this.isGeneratingReport = true;
  
  this.declarationService.getPredictionsForDeclaration(this.declarationId).subscribe({
    next: (results) => {
      // Calculer l'écart en pourcentage pour chaque résultat
      results.forEach(result => {
        const declaredValue = result.foncierBati.coutAcquisitionFCFA;
        result.ecartPourcentage = this.calculateEcartPercentage(declaredValue, result.prediction);
      });
      
      // Stocker les résultats pour les afficher dans le template
      this.foncierBatiPredictions = results;
      this.isGeneratingReport = false;
    },
    error: (error) => {
      console.error('Erreur lors de la récupération des prédictions', error);
      this.isGeneratingReport = false;
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Impossible de récupérer les prédictions',
        life: 5000
      });
    }
  });
}

getEcartColor(ecart: number): string {
  if (ecart > 20) return '#ff0000';  // Rouge pour écart important
  if (ecart > 10) return '#ff9900';  // Orange pour écart moyen
  return '#009900';                  // Vert pour écart faible
}

private calculateEcartPercentage(declared: number, predicted: number): number {
  return (Math.abs(declared - predicted) / declared) * 100;
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
  downloadVehiculeFile(vehicule: Vehicule): void {
  if (!vehicule.id) return;

  this.declarationService.downloadVehiculeFile(vehicule.id).subscribe({
    next: (blob: Blob) => {
      // Créer un objet URL pour le blob
      const url = window.URL.createObjectURL(blob);
      
      // Créer un lien temporaire et déclencher le téléchargement
      const a = document.createElement('a');
      a.href = url;
      a.download = vehicule.fileName || `document-vehicule-${vehicule.id}`;
      document.body.appendChild(a);
      a.click();
      
      // Nettoyage
      window.URL.revokeObjectURL(url);
      a.remove();
    },
    error: (error) => {
      console.error('Erreur lors du téléchargement', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Impossible de télécharger le fichier',
        life: 5000
      });
    }
  });
}

downloadAnimauxFile(animal: Animaux): void {
  if (!animal.id) return;

  this.declarationService.downloadAnimauxFile(animal.id).subscribe({
    next: (blob: Blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = animal.fileName || `document-animal-${animal.id}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    },
    error: (error) => {
      console.error('Erreur de téléchargement', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Téléchargement échoué',
        life: 5000
      });
    }
  });
}
downloadAppareilFile(appareil: AppareilElectroMenager): void {
  if (!appareil.id) return;

  this.declarationService.downloadAppareilFile(appareil.id).subscribe({
    next: (blob: Blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = appareil.fileName || `document-appareil-${appareil.id}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    },
    error: (error) => {
      console.error('Erreur de téléchargement', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Impossible de télécharger le fichier',
        life: 5000
      });
    }
  });
}

downloadAutreBienFile(bien: AutreBienDeValeur): void {
  if (!bien.id) return;

  this.declarationService.downloadAutreBienFile(bien.id).subscribe({
    next: (blob: Blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = bien.fileName || `document-bien-${bien.id}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    },
    error: (error) => {
      console.error('Erreur de téléchargement', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Impossible de télécharger le fichier',
        life: 5000
      });
    }
  });
}

downloadDetteFile(dette: AutreDette): void {
  if (!dette.id) return;

  this.declarationService.downloadDetteFile(dette.id).subscribe({
    next: (blob: Blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = dette.fileName || `document-dette-${dette.id}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    },
    error: (error) => {
      console.error('Erreur de téléchargement', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Échec du téléchargement du justificatif',
        life: 5000
      });
    }
  });
}

downloadDisponibiliteFile(disponibilite: DisponibiliteEnBanque): void {
  if (!disponibilite.id) return;

  this.declarationService.downloadDisponibiliteFile(disponibilite.id).subscribe({
    next: (blob: Blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = disponibilite.fileName || `attestation-banque-${disponibilite.numeroCompte || disponibilite.id}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    },
    error: (error) => {
      console.error('Erreur de téléchargement', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Échec du téléchargement de l\'attestation',
        life: 5000
      });
    }
  });
}

downloadEmpruntFile(emprunt: Emprunt): void {
  if (!emprunt.id) return;

  this.declarationService.downloadEmpruntFile(emprunt.id).subscribe({
    next: (blob: Blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = emprunt.fileName || `document-emprunt-${emprunt.numeroCompte || emprunt.id}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    },
    error: (error) => {
      console.error('Erreur de téléchargement', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Échec du téléchargement du document',
        life: 5000
      });
    }
  });
}

downloadEspeceFile(espece: Espece): void {
  if (!espece.id) return;

  this.declarationService.downloadEspeceFile(espece.id).subscribe({
    next: (blob: Blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = espece.fileName || `justificatif-espece-${espece.id}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    },
    error: (error) => {
      console.error('Erreur de téléchargement', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Échec du téléchargement du justificatif',
        life: 5000
      });
    }
  });
}

downloadFoncierBatiFile(foncier: FoncierBati): void {
  if (!foncier.id) return;

  this.declarationService.downloadFoncierBatiFile(foncier.id).subscribe({
    next: (blob: Blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = foncier.fileName || `document-foncier-${foncier.id}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    },
    error: (error) => {
      console.error('Erreur de téléchargement', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Échec du téléchargement du document cadastral',
        life: 5000
      });
    }
  });
}

downloadFoncierNonBatiFile(foncier: FoncierNonBati): void {
  if (!foncier.id) return;

  this.declarationService.downloadFoncierNonBatiFile(foncier.id).subscribe({
    next: (blob: Blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = foncier.fileName || `titre-foncier-${foncier.titrePropriete || foncier.id}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    },
    error: (error) => {
      console.error('Erreur de téléchargement', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Échec du téléchargement du titre foncier',
        life: 5000
      });
    }
  });
}

downloadCreanceFile(creance: Creance): void {
  if (!creance.id) return;

  this.declarationService.downloadCreanceFile(creance.id).subscribe({
    next: (blob: Blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = creance.fileName || `justificatif-creance-${creance.id}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    },
    error: (error) => {
      console.error('Erreur de téléchargement', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Échec du téléchargement du justificatif',
        life: 5000
      });
    }
  });
}

// Pour les titres
downloadTitreFile(titre: Titre): void {
  if (!titre.id) return;

  this.declarationService.downloadTitreFile(titre.id).subscribe({
    next: (blob: Blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = titre.fileName || `titre-${titre.id}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    },
    error: (error) => {
      console.error('Erreur de téléchargement', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Échec du téléchargement du titre',
        life: 5000
      });
    }
  });
}

// Pour les revenus
downloadRevenuFile(revenu: Revenu): void {
  if (!revenu.id) return;

  this.declarationService.downloadRevenuFile(revenu.id).subscribe({
    next: (blob: Blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = revenu.fileName || `justificatif-revenu-${revenu.id}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    },
    error: (error) => {
      console.error('Erreur de téléchargement', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Échec du téléchargement du justificatif',
        life: 5000
      });
    }
  });
}

// Pour les meubles
downloadMeubleFile(meuble: MeubleMeublant): void {
  if (!meuble.id) return;

  this.declarationService.downloadMeubleFile(meuble.id).subscribe({
    next: (blob: Blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = meuble.fileName || `facture-meuble-${meuble.id}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    },
    error: (error) => {
      console.error('Erreur de téléchargement', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Échec du téléchargement de la facture',
        life: 5000
      });
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