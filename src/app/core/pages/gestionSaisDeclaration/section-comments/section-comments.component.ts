import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core'; 
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommentaireGenerique } from 'src/app/core/models/CommentaireGenerique';
import { CommentaireGeneriqueService } from 'src/app/core/services/commentaire-generique.service';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-section-comments',
  templateUrl: './section-comments.component.html',
  styleUrls: ['./section-comments.component.scss'],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-10px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0, transform: 'translateY(-10px)' }))
      ])
    ])
  ]
})
export class SectionCommentsComponent implements OnInit {
  @Input() declarationId: number;
  @Input() sectionType: string;
  @Input() currentUserId: number;

  @Output() commentAdded = new EventEmitter<CommentaireGenerique>();
  @Output() commentDeleted = new EventEmitter<number>();

  commentaires: CommentaireGenerique[] = [];
  commentForm: FormGroup;
  showCommentForm = false;
  loading = false;
  editingCommentId: number | null = null;  // ID du commentaire en cours d'édition

  constructor(
    private commentaireService: CommentaireGeneriqueService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.createCommentForm();
    this.loadComments();
  }

  createCommentForm(): void {
    this.commentForm = this.fb.group({
      contenu: ['', Validators.required]
    });
  }

  loadComments(): void {
    this.loading = true;
    this.commentaireService.getByDeclarationAndType(this.declarationId, this.sectionType)
      .subscribe(
        comments => {
          this.commentaires = comments;
          this.loading = false;
        },
        error => {
          console.error(`Erreur lors du chargement des commentaires pour la section ${this.sectionType}`, error);
          this.commentaires = [];
          this.loading = false;
        }
      );
  }

  toggleCommentForm(): void {
    this.showCommentForm = !this.showCommentForm;
    if (this.showCommentForm) {
      this.commentForm.reset();
    }
  }

  submitComment(): void {
    if (this.commentForm.valid) {
      const comment: CommentaireGenerique = {
        commentaire: this.commentForm.value.contenu,
        typeEntite: this.sectionType,
        utilisateur: { id: this.currentUserId } as any,
        declaration: { id: this.declarationId } as any,
        dateComment: new Date()
      };

      this.loading = true;
      this.commentaireService.create(comment).subscribe(
        newComment => {
          this.commentaires.unshift(newComment);
          this.commentForm.reset();
          this.showCommentForm = false;
          this.commentAdded.emit(newComment);
          this.loading = false;
        },
        error => {
          console.error('Erreur lors de la création du commentaire', error);
          this.loading = false;
        }
      );
    }
  }

  // Méthode pour déclencher l'édition
  editComment(comment: CommentaireGenerique): void {
    this.editingCommentId = comment.id;  // On marque ce commentaire comme étant en mode édition
  }

  // Méthode pour soumettre l'édition
  submitEdit(comment: CommentaireGenerique): void {
    if (comment.commentaire.trim()) {
      this.loading = true;
      this.commentaireService.update(comment.id, comment).subscribe(
        updatedComment => {
          // Remplacer le commentaire dans la liste par celui mis à jour
          const index = this.commentaires.findIndex(c => c.id === updatedComment.id);
          if (index !== -1) {
            this.commentaires[index] = updatedComment;
          }

          // Réinitialiser l'édition
          this.editingCommentId = null;
          this.loading = false;
        },
        error => {
          console.error('Erreur lors de la mise à jour du commentaire', error);
          this.loading = false;
        }
      );
    }
  }

  deleteComment(commentId: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce commentaire ?')) {
      this.loading = true;
      this.commentaireService.delete(commentId).subscribe(
        () => {
          this.commentaires = this.commentaires.filter(c => c.id !== commentId);
          this.commentDeleted.emit(commentId);
          this.loading = false;
        },
        error => {
          console.error('Erreur lors de la suppression du commentaire', error);
          this.loading = false;
        }
      );
    }
  }

  isCommentAuthor(comment: CommentaireGenerique): boolean {
    return comment.utilisateur?.id === this.currentUserId;
  }

  formatDate(date: string | Date): string {
    if (!date) return 'À l\'instant';

    const commentDate = new Date(date);

    if (isNaN(commentDate.getTime())) {
      return 'Date invalide';
    }

    const now = new Date();
    now.setHours(0, 0, 0, 0);
    commentDate.setHours(0, 0, 0, 0);

    const diffTime = now.getTime() - commentDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Aujourd\'hui';
    } else if (diffDays === 1) {
      return 'Hier';
    } else if (diffDays > 1) {
      return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
    } else {
      return '';
    }
  }
}
