import { Component } from '@angular/core';
import { Parametrage } from 'src/app/core/models/parametre.model';
import { ParametreGenerauxService } from 'src/app/core/services/parametre-generaux.service';

@Component({
  selector: 'app-parametre-generaux',
  templateUrl: './parametre-generaux.component.html',
  styleUrl: './parametre-generaux.component.scss'
})
export class ParametreGenerauxComponent {

  parametres: Parametrage[] = [];
  isEditingParam = false;
  paramToEdit: Parametrage | null = null;

  constructor(private parametrageService: ParametreGenerauxService) {}

  ngOnInit() {
    this.loadParametres();
  }

  loadParametres() {
    this.parametrageService.getParametrages().subscribe(data => {
      this.parametres = data;
    });
  }

  editParam(param: Parametrage) {
    this.isEditingParam = true;
    this.paramToEdit = { ...param }; // Cloner l'objet pour éviter les modifications directes
  }

  saveUpdatedParam() {
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
  }

  cancelEditParam() {
    this.isEditingParam = false;
    this.paramToEdit = null;
  }
}
