import { Component } from '@angular/core';
import { MessageService } from 'primeng/api';
import { Parametre } from 'src/app/core/models/Parametre.model';
import { ParametreGenerauxService } from 'src/app/core/services/parametre-generaux.service';

@Component({
  selector: 'app-parametre-generaux',
  templateUrl: './parametre-generaux.component.html',
  styleUrls: ['./parametre-generaux.component.scss'],
  providers: [MessageService]

})
export class ParametreGenerauxComponent {

  parametres: Parametre[] = [];
  isEditingParam = false;
  paramToEdit: Parametre | null = null;

  searchQuery: string = '';
  isSearching: boolean = false;
  confirmDialog: boolean = false;

  constructor(private parametrageService: ParametreGenerauxService, private messageService: MessageService) {}

  ngOnInit() {
    this.loadParametres();
  }

  showConfirmationDialog() {
    this.confirmDialog = true;
  }
  
  onConfirm() {
    // Action à effectuer après confirmation
    this.confirmDialog = false;
    this.saveUpdatedParam();
  }
  
  onCancel() {
    this.confirmDialog = false;
  }
  

  loadParametres() {
    this.parametrageService.getParametrages().subscribe(data => {
      this.parametres = data;
    });
  }

  toggleSearch() {
    this.isSearching = !this.isSearching;
    if (!this.isSearching) {
      this.searchQuery = '';  // Clear search query if not searching
      this.loadParametres();  // Reload all parameters if search is off
    }
  }

  onGlobalFilter(dt: any, event: any) {
    const query = event.target.value;
    dt.filterGlobal(query, 'contains');
  }
  

  editParam(param: Parametre) {
    this.isEditingParam = true;
    this.paramToEdit = { ...param }; // Clone pour éviter la modification directe
  }

  /* saveUpdatedParam() {
    if (this.paramToEdit) {
      this.parametrageService.updateValeur(this.paramToEdit.id, this.paramToEdit.valeur)
        .subscribe(updatedParam => {
          const index = this.parametres.findIndex(p => p.id === updatedParam.id);
          if (index !== -1) {
            this.parametres[index] = updatedParam;
          }
          this.cancelEditParam();
        });
    }
  } */

    saveUpdatedParam() {
      if (!this.paramToEdit) {
        return;
      }
      
      // Trim the value to remove extra spaces
      const trimmedValue = this.paramToEdit.valeur.trim();
      
      // Check if the value is empty
      if (!trimmedValue) {
        // You might want to add a message service for notifications
        console.error('La valeur ne peut pas être vide');
        // If you have a message service, you could use it like:
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'La valeur ne peut pas être vide'
        });
        return;
      }
      
      // If validation passes, update the parameter
      this.paramToEdit.valeur = trimmedValue;
      this.parametrageService.updateValeur(this.paramToEdit.id, this.paramToEdit.valeur)
        .subscribe({
          next: (updatedParam) => {
            const index = this.parametres.findIndex(p => p.id === updatedParam.id);
            if (index !== -1) {
              this.parametres[index] = updatedParam;
            }
            this.cancelEditParam();
            
            //Success message if you have a message service
            this.messageService.add({
              severity: 'success',
              summary: 'Succès',
              detail: 'Paramètre mis à jour avec succès'
            });
          },
          error: (error) => {
            console.error('Erreur lors de la mise à jour:', error);
            // Error message if you have a message service
            this.messageService.add({
              severity: 'error',
              summary: 'Erreur',
              detail: 'Erreur lors de la mise à jour du paramètre'
            });
          }
        });
    }

  cancelEditParam() {
    this.isEditingParam = false;
    this.paramToEdit = null;
  }
}
