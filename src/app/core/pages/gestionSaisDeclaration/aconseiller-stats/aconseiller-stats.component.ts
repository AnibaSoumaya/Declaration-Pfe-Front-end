import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { UserService } from 'src/app/core/services/user.service';
import { BaseChartDirective } from 'ng2-charts';
import { ConseillerStatisticsService } from 'src/app/core/services/conseiller-statistics-service.service';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as moment from 'moment';

@Component({
  selector: 'app-conseiller-stats',
  templateUrl: './Aconseiller-stats.component.html',
  styleUrls: ['./Aconseiller-stats.component.scss']
})
export class ConseillerStatsComponent implements OnInit, AfterViewInit {

  @ViewChild('declarationsChart') declarationsChart!: BaseChartDirective;
  @ViewChild('performanceChart') performanceChart!: BaseChartDirective;
  @ViewChild('tempsTraitementChart') tempsTraitementChart!: BaseChartDirective;
  @ViewChild('typesChart') typesChart!: BaseChartDirective;
  @ViewChild('validationChart') validationChart!: BaseChartDirective;

  currentUserId: number = 0;
  conseillerStats: any = {
    dossiersAssignes: 0,
    dossiersTraites: 0,
    performanceVerification: null,
    // New properties for additional stats
    rapportsGeneres: 0,
    observationsRealisees: 0,
    tauxValidation: 0,
    tauxRejet: 0
  };

  // Data arrays
  declarationsAssignees: any[] = [];
  repartitionParType: any[] = [];
  statistiquesValidation: any = {};
  dashboardData: any = {};
  statistiquesGlobales: any[] = [];

  // Loading states
  isLoadingDashboard = false;
  isLoadingPrioritaires = false;
  isLoadingValidation = false;

  // Couleurs personnalisées
  private orangeColors = [
    'rgba(255, 152, 0, 0.8)',
    'rgba(255, 193, 7, 0.8)',
    'rgba(255, 87, 34, 0.8)',
    'rgba(255, 183, 77, 0.8)',
    'rgba(230, 126, 34, 0.8)'
  ];

  private greenColors = [
    'rgba(76, 175, 80, 0.8)',
    'rgba(139, 195, 74, 0.8)',
    'rgba(46, 125, 50, 0.8)',
    'rgba(102, 187, 106, 0.8)',
    'rgba(67, 160, 71, 0.8)'
  ];

  private blueColors = [
    'rgba(33, 150, 243, 0.8)',
    'rgba(100, 181, 246, 0.8)',
    'rgba(13, 71, 161, 0.8)',
    'rgba(66, 165, 245, 0.8)',
    'rgba(25, 118, 210, 0.8)'
  ];
public declarationsChartOptions: ChartConfiguration['options'] = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: { beginAtZero: true }
  },
  plugins: {
    legend: { display: true, position: 'top' }
  }
};

public declarationsChartType: ChartType = 'bar';
public declarationsChartData: ChartData<'bar'> = {
  labels: [],
  datasets: [{
    data: [],
    label: 'Nombre de déclarations',
    backgroundColor: this.blueColors,
    borderColor: '#ffffff',
    borderWidth: 1
  }]
};
  public performanceChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    scales: { 
      y: { 
        beginAtZero: true,
        grid: { color: 'rgba(0,0,0,0.1)' }
      },
      x: { 
        grid: { display: false } 
      }
    },
    plugins: { 
      legend: { display: true, position: 'top' }
    },
    elements: {
      point: { radius: 6, hoverRadius: 8 }
    }
  };
  
  public performanceChartType: ChartType = 'line';
  public performanceChartData: ChartData<'line'> = {
    labels: [],
    datasets: [{
      data: [],
      label: 'Déclarations traitées par mois',
      borderColor: this.greenColors[0],
      backgroundColor: this.greenColors[0].replace('0.8', '0.2'),
      tension: 0.4,
      fill: true,
      pointBackgroundColor: this.greenColors[0],
      pointBorderColor: '#ffffff',
      pointBorderWidth: 2
    }]
  };
public typesChartOptions: ChartConfiguration['options'] = {
  responsive: true,
  maintainAspectRatio: false,
  indexAxis: 'y', // Pour avoir des barres horizontales
  scales: {
    x: { beginAtZero: true }
  },
  plugins: {
    legend: { display: false }
  }
};

public typesChartType: ChartType = 'bar';
public typesChartData: ChartData<'bar'> = {
  labels: [],
  datasets: [{
    data: [],
    label: 'Nombre',
    backgroundColor: this.greenColors,
    borderColor: '#ffffff',
    borderWidth: 1
  }]
};
  // NEW: Validation statistics chart
  public validationChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    scales: { 
      y: { 
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: function(value) {
            return value + '%';
          }
        }
      }
    },
    plugins: { 
      legend: { display: true, position: 'top' }
    }
  };
  
  public validationChartType: ChartType = 'bar';
  public validationChartData: ChartData<'bar'> = {
    labels: ['Taux de Validation', 'Taux de Rejet'],
    datasets: [{
      data: [0, 0],
      label: 'Pourcentage (%)',
      backgroundColor: [this.greenColors[0], this.orangeColors[2]],
      borderWidth: 1,
      borderColor: [this.greenColors[2], this.orangeColors[4]]
    }]
  };

  loadDashboardData(): void {
    this.isLoadingDashboard = true;
    console.log('Loading dashboard data for user:', this.currentUserId);
    
    this.conseillerStatisticsService.getDashboardConseiller(this.currentUserId).subscribe({
      next: (data) => {
        console.log('Dashboard Data received:', data);
        this.dashboardData = data;
        this.processLoadedData(data);
        this.updateMainCharts();
        this.isLoadingDashboard = false;
      },
      error: (err) => {
        console.error('Error loading dashboard data:', err);
        this.isLoadingDashboard = false;
      }
    });
  }




  private updatePerformanceChart(statistiquesParMois: any[]): void {
    if (statistiquesParMois && statistiquesParMois.length > 0) {
      // Sort by date and take last 6 months
      const sortedStats = statistiquesParMois
        .sort((a, b) => {
          const dateA = new Date(a.annee, this.getMonthNumber(a.mois) - 1);
          const dateB = new Date(b.annee, this.getMonthNumber(b.mois) - 1);
          return dateA.getTime() - dateB.getTime();
        })
        .slice(-6);

      const monthLabels = sortedStats.map(stat => `${stat.mois.substring(0, 3)} ${stat.annee}`);
      const monthData = sortedStats.map(stat => stat.declarationsTraitees || 0);
      
      this.performanceChartData.labels = monthLabels;
      this.performanceChartData.datasets[0].data = monthData;
      
      setTimeout(() => {
        if (this.performanceChart) {
          this.performanceChart.update();
        }
      }, 50);
    }
  }

  private updateTypesChart(): void {
    if (this.repartitionParType && this.repartitionParType.length > 0) {
      this.typesChartData.labels = this.repartitionParType.map(item => 
        this.translateTypeDeclaration(item.type)
      );
      this.typesChartData.datasets[0].data = this.repartitionParType.map(item => item.nombre);
      
      setTimeout(() => {
        if (this.typesChart) {
          this.typesChart.update();
        }
      }, 50);
    }
  }

  private updateValidationChart(): void {
    if (this.statistiquesValidation) {
      this.validationChartData.datasets[0].data = [
        this.statistiquesValidation.tauxValidation || 0,
        this.statistiquesValidation.tauxRejet || 0
      ];
      
      setTimeout(() => {
        if (this.validationChart) {
          this.validationChart.update();
        }
      }, 50);
    }
  }

  private updateMainCharts(): void {
    this.updatePerformanceChart(this.dashboardData.statistiquesParMois || []);
  }

  private updateAllCharts(): void {
    try {
      setTimeout(() => {
        [this.declarationsChart, this.performanceChart, this.typesChart, this.validationChart]
          .forEach(chart => {
            if (chart) {
              chart.update();
            }
          });
      }, 100);
    } catch (error) {
      console.warn('Erreur lors de la mise à jour des graphiques:', error);
    }
  }

  // Helper methods for translation
  private translateEtatDeclaration(etat: string): string {
    const translations: { [key: string]: string } = {
      'en_cours': 'En cours',
      'valider': 'Validé',
      'refuser': 'Refusé',
      'en_attente': 'En attente',
      'traiter': 'Traité'
    };
    return translations[etat] || etat;
  }

  private translateTypeDeclaration(type: string): string {
    const translations: { [key: string]: string } = {
      'Première_déclaration': 'Première déclaration',
      'Mise_à_jour': 'Mise à jour',
      'Déclaration_annuelle': 'Déclaration annuelle',
      'Rectification': 'Rectification'
    };
    return translations[type] || type;
  }

  private getMonthNumber(monthName: string): number {
    const months: { [key: string]: number } = {
      'janvier': 1, 'février': 2, 'mars': 3, 'avril': 4,
      'mai': 5, 'juin': 6, 'juillet': 7, 'août': 8,
      'septembre': 9, 'octobre': 10, 'novembre': 11, 'décembre': 12
    };
    return months[monthName.toLowerCase()] || 1;
  }



  loadDeclarationsAssignees(): void {
    this.conseillerStatisticsService.consulterDeclarationsAssignees(this.currentUserId).subscribe({
      next: (data) => {
        this.declarationsAssignees = data;
        console.log('Déclarations assignées:', data);
      },
      error: (err) => {
        console.error('Erreur lors du chargement des déclarations assignées:', err);
      }
    });
  }

  genererRapportProvisoire(declarationId: number): void {
    this.conseillerStatisticsService.genererRapportProvisoire(this.currentUserId, declarationId).subscribe({
      next: (rapport) => {
        console.log('Rapport provisoire généré:', rapport);
        this.refreshData();
        // Show success message to user
      },
      error: (err) => {
        console.error('Erreur lors de la génération du rapport provisoire:', err);
        // Show error message to user
      }
    });
  }

  verifierDeclaration(declarationId: number): void {
    this.conseillerStatisticsService.verifierDeclaration(this.currentUserId, declarationId).subscribe({
      next: (resultat) => {
        console.log('Résultat de la vérification:', resultat);
        this.refreshData();
        // Show verification results to user
      },
      error: (err) => {
        console.error('Erreur lors de la vérification de la déclaration:', err);
        // Show error message to user
      }
    });
  }





// Ajoutez cette méthode pour initialiser les données vides
private initializeEmptyData(): void {
  this.conseillerStats = {
    dossiersAssignes: 0,
    dossiersTraites: 0,
    rapportsGeneres: 0,
    observationsRealisees: 0,
    tauxValidation: 0,
    tauxRejet: 0
  };

  // Initialisez les graphiques avec des données vides
  this.declarationsChartData = {
    labels: ['En cours', 'Validé', 'Refusé', 'En attente', 'Traité'],
    datasets: [{
      data: [0, 0, 0, 0, 0],
      label: 'Nombre de déclarations',
      backgroundColor: this.blueColors,
      borderColor: '#ffffff',
      borderWidth: 1
    }]
  };

  this.performanceChartData = {
    labels: [],
    datasets: [{
      data: [],
      label: 'Déclarations traitées par mois',
      borderColor: this.greenColors[0],
      backgroundColor: this.greenColors[0].replace('0.8', '0.2'),
      tension: 0.4,
      fill: true
    }]
  };

  this.typesChartData = {
    labels: [],
    datasets: [{
      data: [],
      label: 'Nombre',
      backgroundColor: this.greenColors,
      borderColor: '#ffffff',
      borderWidth: 1
    }]
  };

  this.validationChartData = {
    labels: ['Taux de Validation', 'Taux de Rejet'],
    datasets: [{
      data: [0, 0],
      label: 'Pourcentage (%)',
      backgroundColor: [this.greenColors[0], this.orangeColors[2]]
    }]
  };
}

  // Données supplémentaires
  chargeTravail: any = {
    declarationsEnCours: 0,
    declarationsEnRetard: 0
  };
  
  performanceAnnuelle: any = {
    declarationsValidees: 0,
    declarationsRejetees: 0,
    tauxValidation: 0
  };
  
  declarationsAnciennes: any[] = [];

  // ... (vos autres propriétés existantes) ...

  constructor(
    private conseillerStatisticsService: ConseillerStatisticsService,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    this.getCurrentUser();
    this.initializeEmptyData();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.updateAllCharts();
    }, 100);
  }

  getCurrentUser(): void {
    this.userService.getCurrentUser().subscribe({
      next: (user) => {
        this.currentUserId = user.id;
        this.loadAllData();
      },
      error: (err) => {
        console.error('Erreur lors de la récupération de l\'utilisateur:', err);
        this.currentUserId = 36; // Fallback ID
        this.loadAllData();
      }
    });
  }

  loadAllData(): void {
    this.isLoadingDashboard = true;
    
    // Charge toutes les données via le dashboard complet
    this.conseillerStatisticsService.getDashboardConseiller(this.currentUserId).subscribe({
      next: (data) => {
        this.processLoadedData(data);
        this.isLoadingDashboard = false;
      },
      error: (err) => {
        console.error('Error loading dashboard data:', err);
        this.isLoadingDashboard = false;
      }
    });

    // Charge les données supplémentaires
    this.loadAdditionalData();
  }

  loadAdditionalData(): void {
    // Charge la charge de travail
    this.conseillerStatisticsService.getChargeUtilisateur(this.currentUserId).subscribe({
      next: (data) => {
        this.chargeTravail = data;
      },
      error: (err) => {
        console.error('Erreur lors du chargement de la charge de travail:', err);
      }
    });

    // Charge la performance annuelle
    this.conseillerStatisticsService.getPerformanceAnnuelle(this.currentUserId).subscribe({
      next: (data) => {
        this.performanceAnnuelle = data;
      },
      error: (err) => {
        console.error('Erreur lors du chargement de la performance annuelle:', err);
      }
    });

    // Charge les déclarations anciennes
    this.conseillerStatisticsService.getDeclarationsAnciennes(this.currentUserId).subscribe({
      next: (data) => {
        this.declarationsAnciennes = data;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des déclarations anciennes:', err);
      }
    });
  }

  private processLoadedData(data: any): void {
    // Traitement des données existantes
    this.conseillerStats.dossiersAssignes = data.statistiquesGenerales?.nombreDeclarationsAssignees || 0;
    this.conseillerStats.dossiersTraites = data.statistiquesGenerales?.nombreDeclarationsTraitees || 0;
    this.conseillerStats.rapportsGeneres = data.statistiquesGenerales?.nombreRapportsGeneres || 0;
    this.conseillerStats.observationsRealisees = data.statistiquesGenerales?.nombreObservations || 0;

    // Mise à jour des graphiques
    if (data.statistiquesParMois) {
      this.updatePerformanceChart(data.statistiquesParMois);
    }

    if (data.performanceVerification) {
      this.updateValidationChartData(data.performanceVerification);
    }

    // Traitement des nouvelles données
    if (data.chargeTravail) {
      this.chargeTravail = data.chargeTravail;
    }

    if (data.performanceAnnuelle) {
      this.performanceAnnuelle = data.performanceAnnuelle;
    }

    if (data.declarationsAnciennes) {
      this.declarationsAnciennes = data.declarationsAnciennes;
    }
  }

  private updateValidationChartData(performanceData: any): void {
    this.validationChartData.datasets[0].data = [
      performanceData.tauxValidation || 0,
      performanceData.tauxRejet || 0
    ];
    
    if (this.validationChart) {
      this.validationChart.update();
    }
  }

  // ... (vos autres méthodes existantes) ...

  openDeclaration(declarationId: number): void {
    // Implémentez la logique pour ouvrir une déclaration
    console.log('Ouverture de la déclaration:', declarationId);
  }

  refreshData(): void {
    this.loadAllData();
  }
}