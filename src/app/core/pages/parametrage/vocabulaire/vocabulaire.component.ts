import { Component, OnInit } from '@angular/core';
import { TypeVocabulaire } from 'src/app/core/models/TypeVocabulaire.model';
import { Vocabulaire } from 'src/app/core/models/Vocabulaire.model';
import { VocabulaireService } from 'src/app/core/services/vocabulaire.service';

@Component({
  selector: 'app-vocabulaire',
  templateUrl: './vocabulaire.component.html',
})
export class VocabulaireComponent implements OnInit {
  sourceCities: TypeVocabulaire[] = [];
  selectedTypeVocabulaire: TypeVocabulaire | null = null;
  vocabulaireList: Vocabulaire[] = [];
  selectedUsers: any[] = [];
  searchQuery: string = '';
  isSearching: boolean = false;
  tempVocabulaireList: Vocabulaire | null = null;

  // Objet temporaire pour la ligne d'ajout
  tempVocabulaire: Vocabulaire | null = null;

  constructor(private vocabulaireService: VocabulaireService) {}

  ngOnInit(): void {
    this.vocabulaireService.getTypesVocabulaire().subscribe(types => {
      this.sourceCities = types;
    });

    // Initially, load all vocabulaire
    this.loadAllVocabulaire();
  }

  onTypeVocabulaireChange() {
    if (this.selectedTypeVocabulaire) {
      // If a type is selected, fetch vocabulaire by that type
      this.vocabulaireService.getVocabulaireByType(this.selectedTypeVocabulaire.id).subscribe(vocabulaire => {
        this.vocabulaireList = vocabulaire;
      });
    } else {
      // If no type is selected, fetch all vocabulaire
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
      is_active: true,
    };
  }

  // Annuler l'ajout
  cancelNewRow() {
    this.tempVocabulaire = null;
  }

  // Sauvegarde du vocabulaire
  saveVocabulaire() {
    if (!this.tempVocabulaire || !this.tempVocabulaire.intitule?.trim()) {
      console.error('L\'intitulé ne peut pas être vide');
      return;
    }

    this.vocabulaireService.createVocabulaire(this.tempVocabulaire).subscribe(
      (savedVocabulaire) => {
        this.vocabulaireList.push(savedVocabulaire);
        this.tempVocabulaire = null;
        console.log('Vocabulaire ajouté avec succès');
      },
      (error) => {
        console.error('Erreur lors de l\'ajout du vocabulaire:', error);
      }
    );
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
  

  toggleActivation(vocabulaire: Vocabulaire) {
    vocabulaire.is_active = !vocabulaire.is_active;

    const action = vocabulaire.is_active ? 
      this.vocabulaireService.enableVocabulaire(vocabulaire.id) : 
      this.vocabulaireService.disableVocabulaire(vocabulaire.id);

    action.subscribe(() => {
      console.log(`Vocabulaire ${vocabulaire.id} mis à jour.`);
    });
  }
}
