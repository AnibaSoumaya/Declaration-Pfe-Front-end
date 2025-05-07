import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { forkJoin, Subject } from 'rxjs';
import { debounceTime, switchMap } from 'rxjs/operators';
import { Declaration } from 'src/app/core/models/declaration';
import { User } from 'src/app/core/models/User.model';
import { DeclarationService } from 'src/app/core/services/declaration.service';
import { UserService } from 'src/app/core/services/user.service';

@Component({
  selector: 'app-declaration-details',
  templateUrl: './declaration-details.component.html',
  styleUrls: ['./declaration-details.component.scss'],
  providers: [MessageService],
})
export class DeclarationDetailsComponent implements OnInit {
  declarations: Declaration[] = [];
  selectedDeclarations: Declaration[] = [];
  displayChangeManagerDialog = false;
  conseillers: User[] = [];
  selectedGerant: User | null = null;
  searchQuery: string = ''; 
  isSearching: boolean = false;  

  constructor(
    private declarationService: DeclarationService,
    private utilisateurService: UserService,
    private router: Router,
    private route: ActivatedRoute  // Ajouté ici

  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const id = params['id'];
      // Utilise l'id comme tu veux
    });
    this.loadDeclarations();
    this.loadConseillers();


    this.handleSearch();
  }

  afficherDeclaration(id: number): void {
    this.router.navigate(['/controleDeclaration', id]);
  }
  
  loadDeclarations(): void {
    this.declarationService.getAllDeclarations().subscribe(
      data => this.declarations = data,
      error => console.error('Erreur lors du chargement des déclarations', error)
    );
  }

  loadConseillers(): void {
    this.utilisateurService.getAllUsers().subscribe(
      data => {
        this.conseillers = data
          .filter(user => user.role?.includes('conseiller_rapporteur'))
          .map(user => ({
            ...user,
            fullName: `${user.firstname} ${user.lastname}`
          }));
      },
      error => console.error('Erreur chargement utilisateurs', error)
    );
  }

  toggleSearch(): void {
    this.isSearching = !this.isSearching;

    if (!this.isSearching) {
      this.searchQuery = ''; 
      this.loadDeclarations(); 
    }
  }
  handleSearch(): void {
    const searchSubject = new Subject<string>();  

    searchSubject.pipe(
      debounceTime(300),  
      switchMap((keyword: string) => {
        return this.declarationService.searchDeclarations(keyword); 
      })
    ).subscribe(
      (data: Declaration[]) => {
        this.declarations = data;  
      },
      (error) => console.error('Erreur lors de la recherche', error)
    );

    searchSubject.next(this.searchQuery); 
  }

  onGlobalFilter(dt: any, event: Event): void {
    const input = event.target as HTMLInputElement;
    const keyword = input.value;

    if (keyword.trim().length > 0) {
      this.declarationService.searchDeclarations(keyword).subscribe(
        data => this.declarations = data,
        error => console.error('Erreur lors de la recherche', error)
      );
    } else {
      this.loadDeclarations(); 
    }
  }

  openChangeManagerDialog(): void {
    this.displayChangeManagerDialog = true;
  }

  assignGerantToSelectedDeclarations(): void {
    if (!this.selectedGerant) return;

    const requests = this.selectedDeclarations.map(decl =>
      this.declarationService.assignGerantToDeclaration(decl.id, this.selectedGerant!.id)
    );

    forkJoin(requests).subscribe(() => {
      this.loadDeclarations(); 
      this.displayChangeManagerDialog = false; 
      this.selectedDeclarations = []; 
      this.selectedGerant = null; 
    });
  }

  downloadDeclarationPdf(id: number): void {
    this.declarationService.generatePdf(id).subscribe(
      (response: Blob) => {
        const blob = new Blob([response], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `declaration-${id}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error => console.error('Erreur téléchargement PDF', error)
    );
  }
}
