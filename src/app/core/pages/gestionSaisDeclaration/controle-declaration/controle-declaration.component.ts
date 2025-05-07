import { Component, Input, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { DeclarationService } from 'src/app/core/services/declaration.service';
import { CommentaireGeneriqueService } from 'src/app/core/services/commentaire-generique.service';
import { CommentaireGenerique } from 'src/app/core/models/CommentaireGenerique';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Declaration } from 'src/app/core/models/declaration';
import { User } from 'src/app/core/models/User.model';
import { UserService } from 'src/app/core/services/user.service';

@Component({
  selector: 'app-controle-declaration',
  templateUrl: './controle-declaration.component.html',
  styleUrls: ['./controle-declaration.component.scss']
})
export class ControleDeclarationComponent implements OnInit {
  @Input() declarationId: number;
  declaration: Declaration;
  loading = true;
  error = false;

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

  constructor(
    private declarationService: DeclarationService,
    private commentaireService: CommentaireGeneriqueService,
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder
  ) {
    this.createCommentForm();
  }

  ngOnInit(): void {
    this.userService.getCurrentUser().subscribe(
      user => {
        this.currentUser = user;
        if (!this.declarationId) {
          this.route.params.subscribe(params => {
            if (params['id']) {
              this.declarationId = +params['id'];
              this.loadDeclaration();
            }
          });
        } else {
          this.loadDeclaration();
        }
      },
      error => {
        console.error("Erreur lors de la récupération de l'utilisateur connecté", error);
      }
    );
  }

  createCommentForm(): void {
    this.commentForm = this.fb.group({
      commentaire: ['', Validators.required]
    });
  }

  loadDeclaration(): void {
    this.loading = true;
    this.declarationService.getDeclarationDetails(this.declarationId)
      .subscribe(
        data => {
          this.declaration = data;
          this.loading = false;
        },
        error => {
          console.error('Erreur lors du chargement de la déclaration', error);
          this.error = true;
          this.loading = false;
        }
      );
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
      .subscribe(
        (response: any) => {
          const file = new Blob([response], { type: 'application/pdf' });
          const fileURL = URL.createObjectURL(file);
          window.open(fileURL);
        },
        error => {
          console.error('Erreur lors de la génération du PDF', error);
        }
      );
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
}
