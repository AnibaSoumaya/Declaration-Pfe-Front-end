import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { Assujetti } from 'src/app/core/models/Assujetti.model';
import { TypeVocabulaire } from 'src/app/core/models/TypeVocabulaire.model';
import { Vocabulaire } from 'src/app/core/models/Vocabulaire.model';
import { gestionAssujettiService } from 'src/app/core/services/gestion-assujetti.service';

@Component({
  templateUrl: './crud-assujettis.component.html',
  selector: 'app-vocabulaire',
  providers: [MessageService]
})
export class CrudAssujettisComponent implements OnInit {
    assujettiDialog: boolean = false;
    deleteAssujettiDialog: boolean = false;
    deleteAssujettisDialog: boolean = false;

    assujettis: Assujetti[] = [];
    assujetti: Assujetti = new Assujetti();
    selectedAssujettis: Assujetti[] = [];
    submitted: boolean = false;

    selectedTypeVocabulaire: TypeVocabulaire | null = null;

    /*vocabulaireList: any[] = []; // You can type it more specifically if needed
  */
    sourceCities: TypeVocabulaire[] = [];

    // Column definitions for the table
    cols: any[] = [];
    isSearching: boolean = false;
    searchQuery: string = '';
  

    selectedVoc: { [key: string]: any } = {}; // Stocke la sélection de chaque type

    
    vocabulaireListByType: { [key: number]: Vocabulaire[] } = {}; // Dictionnaire pour filtrer les vocabulaires

    typesVocabulaire: TypeVocabulaire[] = [];
    vocabulaireList: Vocabulaire[] = [];
    selectedVocabulaire: Vocabulaire;

    constructor(private assujettiService: gestionAssujettiService, private messageService: MessageService) { }

    ngOnInit() {
      // Define table columns
      this.cols = [
        { field: 'code', header: 'Code' },
        { field: 'nom', header: 'Nom & Prenom' },
        { field: 'email', header: 'E-mail' },
        { field: 'fonction', header: 'Fonction' },
        { field: 'datep', header: 'Date Prise de Service' },
        { field: 'contacttel', header: 'Contact' },
        { field: 'etat', header: 'Etat' }
      ];
      


      this.assujettiService.getTypesVocabulaire().subscribe((types) => {
        this.typesVocabulaire = types;
        
         // Récupération des vocabulaires et filtrage par type
      this.typesVocabulaire.forEach(type => {
        this.assujettiService.getVocabulaireByTypeId(type.id).subscribe((vocabulaire) => {
          // Stockage des vocabulaires filtrés par type
          this.vocabulaireListByType[type.id] = vocabulaire;
        });
      });
    });
        
      
    
      this.getAllAssujettis();
    }

    
    
  /*
  onTypeVocabulaireChange() {
    if (this.selectedTypeVocabulaire) {
      this.assujettiService.getVocabulaireByType(this.selectedTypeVocabulaire.id).subscribe(
        (vocabulaire) => {
          this.vocabulaireList = vocabulaire;
          console.log('Vocabulaire sélectionné:', this.selectedTypeVocabulaire);

        },
        (error) => console.error('Erreur récupération vocabulaires:', error)
      );
    } else {
      this.vocabulaireList = [];
    }

  }
    
  */
  // Cette méthode est appelée lorsque le type de vocabulaire change
  onTypeVocabulaireChange() {
    if (this.selectedTypeVocabulaire) {
      this.assujettiService.getVocabulaireByTypeId(this.selectedTypeVocabulaire.id).subscribe((vocabulaire) => {
        this.vocabulaireList = vocabulaire;
        console.log("Vocabulaire chargé:", this.vocabulaireList); // Vérification dans la console
      }, error => {
        console.error("Erreur de récupération des vocabulaires:", error);
      });
    }
  }





    
    


  toggleSearch() {
    this.isSearching = !this.isSearching;
    if (!this.isSearching) {
      this.searchQuery = ''; // Réinitialiser la recherche si on ferme
    }
  }
  getAllAssujettis(): void {
    this.assujettiService.getAllAssujettis().subscribe(
      (data: Assujetti[]) => {
        this.assujettis = data;
        console.log('Liste des assujettis:', this.assujettis); // Affichage dans la console
      },
      (error) => {
        console.error('Erreur lors du chargement des assujettis:', error);
      }
    );
  }


    openNew() {
      this.assujetti = new Assujetti();
      this.submitted = false;
      this.assujettiDialog = true;
    }

    saveAssujetti() {
      // Vérifie si les vocabulaires sélectionnés sont bien affectés à assujetti
      Object.keys(this.selectedVoc).forEach(key => {
        this.assujetti[key] = this.selectedVoc[key]; 
      });
    
      console.log("Données envoyées :", this.assujetti); // Vérification
    
      this.assujettiService.createAssujetti(this.assujetti).subscribe({
        next: (response) => {
          console.log("Réponse du backend :", response);
        },
        error: (error) => {
          console.error("Erreur lors de la création :", error);
        }
      });
    }
    
    


    editAssujetti(assujetti: Assujetti) {
      this.assujetti = { ...assujetti };
      this.assujettiDialog = true;
    }

    deleteAssujetti(assujetti: Assujetti) {
      this.deleteAssujettiDialog = true;
      this.assujetti = assujetti;
    }

    confirmDelete() {
      this.assujettiService.deleteAssujetti(this.assujetti.id).subscribe(() => {
        this.getAllAssujettis();
        this.deleteAssujettiDialog = false;
      });
    }

    deleteSelectedAssujettis() {
      const ids = this.selectedAssujettis.map(a => a.id);
      this.assujettiService.deleteSelectedAssujettis(ids).subscribe(() => {
        this.getAllAssujettis();
        this.deleteAssujettisDialog = false;
      });
    }

    // Function for global filter
    onGlobalFilter(dt: any, event: any) {
      const query = event.target.value;
      dt.filterGlobal(query, 'contains');
    }
}
