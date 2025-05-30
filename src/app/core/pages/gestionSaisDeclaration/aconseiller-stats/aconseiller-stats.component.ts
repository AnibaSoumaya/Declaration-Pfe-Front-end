import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { UserService } from 'src/app/core/services/user.service';
import { BaseChartDirective } from 'ng2-charts';
import { ConseillerStatisticsService } from 'src/app/core/services/conseiller-statistics-service.service';

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
    dossiersEnCours: 0,
    delaiMoyen: 0,
    performanceVerification: null,
    // New properties for additional stats
    rapportsGeneres: 0,
    observationsRealisees: 0,
    tauxValidation: 0,
    tauxRejet: 0
  };

  // Data arrays
  declarationsAssignees: any[] = [];
  declarationsPrioritaires: any[] = [];
  repartitionParEtat: any[] = [];
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

  // Chart configurations
  public declarationsChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        display: true, 
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20
        }
      }
    }
  };
  
  public declarationsChartType: ChartType = 'pie';
  public declarationsChartData: ChartData<'pie'> = {
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: [...this.orangeColors, ...this.greenColors],
      borderWidth: 2,
      borderColor: '#ffffff'
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
    plugins: { 
      legend: { 
        display: true, 
        position: 'top',
        labels: { usePointStyle: true, padding: 15 }
      }
    }
  };
  
  public typesChartType: ChartType = 'doughnut';
  public typesChartData: ChartData<'doughnut'> = {
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: [...this.blueColors, ...this.orangeColors],
      borderWidth: 2,
      borderColor: '#ffffff'
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

  constructor(
    private conseillerStatisticsService: ConseillerStatisticsService,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    this.getCurrentUser();
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
        console.log('Current User ID:', this.currentUserId);
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
    this.loadDashboardData();
    this.loadDeclarationsPrioritaires();
    this.loadRepartitionParType();
    this.loadStatistiquesValidation();
  }

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

  loadDeclarationsPrioritaires(): void {
    this.isLoadingPrioritaires = true;
    this.conseillerStatisticsService.getDeclarationsPrioritaires(this.currentUserId).subscribe({
      next: (data) => {
        this.declarationsPrioritaires = data;
        console.log('Déclarations prioritaires:', data);
        this.isLoadingPrioritaires = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des déclarations prioritaires:', err);
        this.isLoadingPrioritaires = false;
      }
    });
  }

  loadRepartitionParType(): void {
    this.conseillerStatisticsService.getRepartitionParType(this.currentUserId).subscribe({
      next: (data) => {
        this.repartitionParType = data;
        this.updateTypesChart();
        console.log('Répartition par type:', data);
      },
      error: (err) => {
        console.error('Erreur lors du chargement de la répartition par type:', err);
      }
    });
  }

  loadStatistiquesValidation(): void {
    this.isLoadingValidation = true;
    this.conseillerStatisticsService.getStatistiquesValidation(this.currentUserId).subscribe({
      next: (data) => {
        this.statistiquesValidation = data;
        this.conseillerStats.tauxValidation = data.tauxValidation || 0;
        this.conseillerStats.tauxRejet = data.tauxRejet || 0;
        this.updateValidationChart();
        console.log('Statistiques de validation:', data);
        this.isLoadingValidation = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des statistiques de validation:', err);
        this.isLoadingValidation = false;
      }
    });
  }

  private processLoadedData(data: any): void {
    // Update main stats cards
    this.conseillerStats.dossiersAssignes = data.nombreDeclarationsAssignees || 0;
    this.conseillerStats.dossiersTraites = data.nombreDeclarationsTraitees || 0;
    this.conseillerStats.dossiersEnCours = data.nombreDeclarationsEnCours || 0;
    this.conseillerStats.delaiMoyen = Math.round(data.tempsTraitementMoyen || 0);

    // Process repartition par etat for pie chart
    if (data.repartitionParEtat && data.repartitionParEtat.length > 0) {
      this.repartitionParEtat = data.repartitionParEtat;
      this.updateDeclarationsChart();
    }

    // Process monthly statistics for line chart
    if (data.statistiquesParMois && data.statistiquesParMois.length > 0) {
      this.updatePerformanceChart(data.statistiquesParMois);
    }

    // Process performance data
    if (data.performance) {
      this.conseillerStats.performanceVerification = data.performance;
      this.conseillerStats.rapportsGeneres = data.performance.totalRapportsGeneres || 0;
      this.conseillerStats.observationsRealisees = data.performance.totalObservations || 0;
    }
  }

  private updateDeclarationsChart(): void {
    if (this.repartitionParEtat && this.repartitionParEtat.length > 0) {
      this.declarationsChartData.labels = this.repartitionParEtat.map(item => 
        this.translateEtatDeclaration(item.etat)
      );
      this.declarationsChartData.datasets[0].data = this.repartitionParEtat.map(item => item.nombre);
      
      setTimeout(() => {
        if (this.declarationsChart) {
          this.declarationsChart.update();
        }
      }, 50);
    }
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
    this.updateDeclarationsChart();
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

  // Action methods
  refreshData(): void {
    this.loadAllData();
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

  // NEW: Additional utility methods
  getPriorityLevel(joursDepuisDeclaration: number): string {
    if (joursDepuisDeclaration > 60) return 'Critique';
    if (joursDepuisDeclaration > 30) return 'Élevée';
    if (joursDepuisDeclaration > 15) return 'Moyenne';
    return 'Normale';
  }

  getPriorityClass(joursDepuisDeclaration: number): string {
    if (joursDepuisDeclaration > 60) return 'priority-critical';
    if (joursDepuisDeclaration > 30) return 'priority-high';
    if (joursDepuisDeclaration > 15) return 'priority-medium';
    return 'priority-normal';
  }

  exportStatistics(): void {
    // Implement export functionality
    const data = {
      conseillerStats: this.conseillerStats,
      declarationsPrioritaires: this.declarationsPrioritaires,
      statistiquesValidation: this.statistiquesValidation,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `statistiques_conseiller_${this.currentUserId}_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  }
}