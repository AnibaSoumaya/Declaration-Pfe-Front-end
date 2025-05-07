import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { TypeVocabulaire } from 'src/app/core/models/TypeVocabulaire.model';
import { Vocabulaire } from 'src/app/core/models/Vocabulaire.model';
import { VocabulaireService } from 'src/app/core/services/vocabulaire.service';

@Component({
  selector: 'app-vocabulaire',
  templateUrl: './vocabulaire.component.html',
  providers: [MessageService],
  styles: [`
    ::ng-deep .p-inputswitch.p-inputswitch-checked .p-inputswitch-slider {
      background-color: #4CAF50 !important;
    }
    
    ::ng-deep .p-inputswitch.p-inputswitch-checked:not(.p-disabled):hover .p-inputswitch-slider {
      background-color: #3e8e41 !important;
    }
  `]

})
export class VocabulaireComponent implements OnInit {
  sourceCities: TypeVocabulaire[] = [];
  selectedTypeVocabulaire: TypeVocabulaire | null = null;
  vocabulaireList: Vocabulaire[] = [];
  selectedUsers: any[] = [];
  searchQuery: string = '';
  isSearching: boolean = false;
  tempVocabulaireList: Vocabulaire | null = null;

  editingVocabulaireId: number | null = null;

  // Objet temporaire pour la ligne d'ajout
  tempVocabulaire: Vocabulaire | null = null;


  constructor(private vocabulaireService: VocabulaireService,private messageService: MessageService) {}

  ngOnInit(): void {
    this.vocabulaireService.getTypesVocabulaire().subscribe(types => {
      this.sourceCities = types;
    });

    // Initially, load all vocabulaire
    this.loadAllVocabulaire();
  }

  onTypeVocabulaireChange() {
    if (this.selectedTypeVocabulaire) {
      // Récupérer les vocabulaire pour ce type
      this.vocabulaireService.getVocabulaireByType(this.selectedTypeVocabulaire.id).subscribe(vocabulaire => {
        // Vérifier que `is_active` est bien chargé avec les valeurs attendues
        console.log('Données récupérées:', vocabulaire);
  
        // Mettre à jour le vocabulaire avec la valeur correcte de is_active
        this.vocabulaireList = vocabulaire.map(item => ({
          ...item,
          isActive: item.isActive || false // Si isActive n'existe pas, on le définit par défaut à false
        }));
  
        // Vérifier après la mise à jour
        console.log('Liste de vocabulaire mise à jour:', this.vocabulaireList);
      });
    } else {
      // Si aucun type n'est sélectionné, charger tous les vocabulaire
      this.loadAllVocabulaire();
    }
  }
  

  // Method to load all vocabulaire
  loadAllVocabulaire() {
    this.vocabulaireService.getAllVocabulaire().subscribe(vocabulaire => {
      this.vocabulaireList = vocabulaire;
    });
  }

  // Ajouter une ligne temporaire
  addNewRow() {
    if (!this.selectedTypeVocabulaire) return;

    this.tempVocabulaire = {
      intitule: '',
      typevocabulaire: this.selectedTypeVocabulaire,
      isActive: true,
    };
  }

  // Annuler l'ajout
  cancelNewRow() {
    this.tempVocabulaire = null;
  }

  saveVocabulaire() {
    if (!this.tempVocabulaire || !this.tempVocabulaire.intitule?.trim()) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'L\'intitulé ne peut pas être vide'
      });
      return;
    }
  
    // Trim l’intitulé
    this.tempVocabulaire.intitule = this.tempVocabulaire.intitule.trim();
  
    this.vocabulaireService.createVocabulaire(this.tempVocabulaire).subscribe({
      next: (savedVocabulaire) => {
        this.vocabulaireList.push(savedVocabulaire);
        this.tempVocabulaire = null;
  
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Vocabulaire ajouté avec succès'
        });
      },
      error: () => {
        // Message générique en cas d’erreur
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Le vocabulaire avec cet intitulé existe déjà.'
        });
      }
    });
  }
  

  editVocabulaire(vocabulaire: Vocabulaire) {
    this.editingVocabulaireId = vocabulaire.id;
  }
  
  
  cancelEdit(): void {
    // Tu peux aussi recharger les données si tu veux annuler les changements
    this.editingVocabulaireId = null;
  }

  updateVocabulaire(vocabulaire: Vocabulaire) {
    if (!vocabulaire.intitule?.trim()) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'L\'intitulé ne peut pas être vide'
      });
      return;
    }
  
    // Trim l’intitulé
    vocabulaire.intitule = vocabulaire.intitule.trim();
  
    this.vocabulaireService.updateVoc(vocabulaire).subscribe({
      next: (updated) => {
        console.log('Vocabulaire mis à jour', updated);
        this.editingVocabulaireId = null;
  
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Vocabulaire mis à jour avec succès'
        });
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Le vocabulaire avec cet intitulé existe déjà.'
        });
      }
    });
  }
  
  

  

  toggleSearch() {
    this.isSearching = !this.isSearching;
    
    if (!this.isSearching) {
      // Clear the search query when search mode is turned off
      this.searchQuery = '';
      this.onTypeVocabulaireChange();
    }
  }

  onGlobalFilter(dt: any, event: any) {
    // Ensure the filter is applied to the global fields such as 'intitule'
    dt.filterGlobal(event.target.value, 'contains');
  }
  

  toggleActivation(vocabulaire: Vocabulaire, newValue: boolean) {
    vocabulaire.isActive = newValue;
  
    const action = newValue
      ? this.vocabulaireService.enableVocabulaire(vocabulaire.id)
      : this.vocabulaireService.disableVocabulaire(vocabulaire.id);
  
    action.subscribe(() => {
      console.log(vocabulaire.isActive);
      console.log(`Vocabulaire ${vocabulaire.id} mis à jour à ${newValue}.`);
    });
  }
  
}
