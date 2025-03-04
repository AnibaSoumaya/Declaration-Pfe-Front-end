import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { Assujetti } from 'src/app/core/models/Assujetti.model';
import { gestionAssujettiService } from 'src/app/core/services/gestion-assujetti.service';

@Component({
  templateUrl: './crud-assujettis.component.html',
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

  // Column definitions for the table
  cols: any[] = [];
  isSearching: boolean = false;
  searchQuery: string = '';

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

    this.getAllAssujettis();
  }



toggleSearch() {
  this.isSearching = !this.isSearching;
  if (!this.isSearching) {
    this.searchQuery = ''; // Réinitialiser la recherche si on ferme
  }
}
  getAllAssujettis() {
    this.assujettiService.getAllAssujettis().subscribe(data => {
      this.assujettis = data;
    });
  }

  openNew() {
    this.assujetti = new Assujetti();
    this.submitted = false;
    this.assujettiDialog = true;
  }

  saveAssujetti() {
    this.submitted = true;

    if (this.assujetti.id) {
      this.assujettiService.updateAssujetti(this.assujetti.id, this.assujetti).subscribe(() => {
        this.getAllAssujettis();
        this.assujettiDialog = false;
      });
    } else {
      this.assujettiService.createAssujetti(this.assujetti).subscribe(() => {
        this.getAllAssujettis();
        this.assujettiDialog = false;
      });
    }
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
