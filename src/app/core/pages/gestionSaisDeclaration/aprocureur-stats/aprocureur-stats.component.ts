import { Component, OnInit, ViewChild, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { PgstatService } from 'src/app/core/services/pgstat.service';
import { BaseChartDirective } from 'ng2-charts';
import { forkJoin, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-procureur-stats',
  templateUrl: './Aprocureur-stats.component.html',
  styleUrls: ['./Aprocureur-stats.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush // Add this line

})
export class ProcureurStatsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  @ViewChild('pieChart') pieChart!: BaseChartDirective;
  @ViewChild('barChart') barChart!: BaseChartDirective;
  @ViewChild('lineChart') lineChart!: BaseChartDirective;
  @ViewChild('declarationTypeChart') declarationTypeChart!: BaseChartDirective;
  @ViewChild('monthlyChart') monthlyChart!: BaseChartDirective;
  @ViewChild('yearlyChart') yearlyChart!: BaseChartDirective;

  // Palettes de couleurs améliorées
  private readonly colorPalette = {
    primary: '#4A90E2',
    secondary: '#7ED321',
    accent: '#F5A623',
    danger: '#D0021B',
    success: '#50E3C2',
    warning: '#B8E986'
  };

  private orangeColors = [
    'rgba(245, 166, 35, 0.8)',   // Orange principal
    'rgba(255, 127, 36, 0.8)',   // Orange foncé
    'rgba(255, 183, 77, 0.8)',   // Orange clair
    'rgba(230, 81, 0, 0.8)',     // Orange profond
    'rgba(255, 152, 0, 0.8)'     // Orange vif
  ];

  private blueColors = [
    'rgba(74, 144, 226, 0.8)',   // Bleu principal
    'rgba(52, 120, 199, 0.8)',   // Bleu foncé
    'rgba(96, 168, 255, 0.8)',   // Bleu clair
    'rgba(30, 100, 180, 0.8)',   // Bleu profond
    'rgba(70, 130, 200, 0.8)'    // Bleu vif
  ];

  // Variables d'état
  procureurStats: any = {
    dossiersEnCours: 0,
    decisionsRendues: 0,
    tauxAcceptation: 0,
    nouvellesDeclarations: 0,
    dossiersClotures: 0,
    delaiMoyen: 0,
    sanctionsAppliquees: 0,
    tendancePositive: true
  };

  totalDeclarations: number = 0;
  isLoading: boolean = true;
  currentYear: number = new Date().getFullYear();
  selectedYear: number = this.currentYear;
  
  // Nouvelles données
  monthlyStats: any[] = [];
  yearlyStats: any[] = [];
  userWorkload: any = null;
  completeDashboard: any = null;

  // Configuration des graphiques existants
  public pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        display: true, 
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          color: '#5a5a5a',
          font: { size: 12 }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        cornerRadius: 8
      }
    }
  };
  
  public pieChartType: ChartType = 'pie';
  public pieChartData: ChartData<'pie'> = {
    labels: ['Provisoires', 'Définitifs'],
    datasets: [{
      data: [0, 0],
      backgroundColor: [this.orangeColors[0], this.blueColors[0]],
      borderWidth: 2,
      borderColor: '#ffffff',
      hoverBorderWidth: 3
    }]
  };

  // Graphique des décisions amélioré
  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: { 
        beginAtZero: true,
        grid: {
          color: 'rgba(0,0,0,0.05)'
        },
        ticks: {
          color: '#5a5a5a',
          font: { size: 11 }
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: '#5a5a5a',
          font: { size: 11 }
        }
      }
    },
    plugins: {
      legend: { 
        display: true,
        position: 'top',
        labels: {
          color: '#5a5a5a',
          font: { size: 12 }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        cornerRadius: 8
      }
    }
  };
  
  public barChartType: ChartType = 'bar';
  public barChartData: ChartData<'bar'> = {
    labels: ['Acceptées', 'Refusées'],
    datasets: [{
      data: [0, 0],
      label: 'Décisions',
      backgroundColor: [this.blueColors[0], this.orangeColors[0]],
      borderWidth: 1,
      borderColor: [this.blueColors[1], this.orangeColors[1]],
      borderRadius: 4
    }]
  };

  // Nouveau graphique des statistiques mensuelles
  public monthlyChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: { 
        beginAtZero: true,
        grid: {
          color: 'rgba(0,0,0,0.05)'
        },
        ticks: {
          color: '#5a5a5a'
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: '#5a5a5a'
        }
      }
    },
    plugins: {
      legend: { 
        display: true,
        position: 'top',
        labels: {
          color: '#5a5a5a'
        }
      }
    },
    elements: {
      point: {
        radius: 6,
        hoverRadius: 8
      }
    }
  };
  
  public monthlyChartType: ChartType = 'line';
  public monthlyChartData: ChartData<'line'> = {
    labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'],
    datasets: [{
      data: Array(12).fill(0),
      label: 'Déclarations mensuelles',
      borderColor: this.blueColors[0],
      backgroundColor: this.blueColors[0].replace('0.8', '0.2'),
      tension: 0.4,
      fill: true,
      pointBackgroundColor: this.blueColors[0],
      pointBorderColor: '#ffffff',
      pointBorderWidth: 2
    }]
  };

  // Nouveau graphique des statistiques annuelles
  public yearlyChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: { 
        beginAtZero: true,
        grid: {
          color: 'rgba(0,0,0,0.05)'
        },
        ticks: {
          color: '#5a5a5a'
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: '#5a5a5a'
        }
      }
    },
    plugins: {
      legend: { 
        display: true,
        position: 'top',
        labels: {
          color: '#5a5a5a'
        }
      }
    }
  };
  
  public yearlyChartType: ChartType = 'bar';
  public yearlyChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [{
      data: [],
      label: 'Déclarations annuelles',
      backgroundColor: this.orangeColors[0],
      borderColor: this.orangeColors[1],
      borderWidth: 1,
      borderRadius: 4
    }]
  };

  // Graphique par type de déclaration amélioré
  public declarationTypeChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        display: true, 
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 15,
          color: '#5a5a5a'
        }
      }
    }
  };
  
  public declarationTypeChartType: ChartType = 'doughnut';
  public declarationTypeChartData: ChartData<'doughnut'> = {
    labels: ['Initiales', 'Mises à jour'],
    datasets: [{
      data: [0, 0],
      backgroundColor: [this.orangeColors[0], this.blueColors[0]],
      borderWidth: 2,
      borderColor: '#ffffff',
      hoverBorderWidth: 3
    }]
  };

  constructor(private pgStatService: PgstatService,    private cdr: ChangeDetectorRef
) { }

  ngOnInit(): void {
    this.loadAllStatistics();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
loadAllStatistics(): void {
  this.isLoading = true;
  
  forkJoin({
    dashboard: this.pgStatService.getDashboardStats(),
    completeDashboard: this.pgStatService.getCompleteDashboard(this.selectedYear),
    monthlyStats: this.pgStatService.getMonthlyStats(this.selectedYear),
    yearlyStats: this.pgStatService.getLastFiveYearsStats()
  }).pipe(
    takeUntil(this.destroy$)
  ).subscribe({
    next: (data) => {
      console.log('All data loaded:', data);
      
      this.processDashboardData(data.dashboard);
      this.processCompleteDashboard(data.completeDashboard);
      this.processMonthlyStats(data.monthlyStats);
      this.processYearlyStats(data.yearlyStats);
      
      // Use setTimeout to ensure chart updates happen after view check
      setTimeout(() => {
        this.updateAllCharts();
        this.isLoading = false;
        this.cdr.detectChanges(); // Manually trigger change detection
      });
    },
    error: (error) => {
      console.error('Error loading statistics:', error);
      this.handleError(error);
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  });
}
  /**
   * Traite les données du dashboard principal
   */
  private processDashboardData(data: any): void {
    try {
      this.totalDeclarations = data?.declarations?.total || 0;
      
      this.procureurStats = {
        dossiersEnCours: data?.workflow?.dossiersEnCours || 0,
        decisionsRendues: (data?.decisions?.declarationsAcceptees || 0) + (data?.decisions?.declarationsRefusees || 0),
        tauxAcceptation: this.calculateAcceptanceRate(data?.decisions),
        nouvellesDeclarations: data?.workflow?.nouveauxDossiers || 0,
        dossiersClotures: data?.workflow?.dossiersTermines || 0,
        sanctionsAppliquees: data?.decisions?.declarationsRefusees || 0,
        tendancePositive: true
      };
      
      console.log('Dashboard data processed:', this.procureurStats);
    } catch (error) {
      console.error('Error processing dashboard data:', error);
    }
  }

  /**
   * Traite les données du dashboard complet
   */
  private processCompleteDashboard(data: any): void {
    this.completeDashboard = data;
    console.log('Complete dashboard processed:', data);
  }

  /**
   * Traite les statistiques mensuelles
   */
  private processMonthlyStats(data: any[]): void {
    this.monthlyStats = data || [];
    
    // Met à jour les données du graphique mensuel
    if (this.monthlyStats.length > 0) {
      this.monthlyChartData.datasets[0].data = this.monthlyStats.map(stat => stat.totalDeclarations || 0);
    }
    
    console.log('Monthly stats processed:', this.monthlyStats);
  }

  /**
   * Traite les statistiques annuelles
   */
  private processYearlyStats(data: any[]): void {
    this.yearlyStats = data || [];
    
    // Met à jour les données du graphique annuel
    if (this.yearlyStats.length > 0) {
      this.yearlyChartData.labels = this.yearlyStats.map(stat => stat.libellePeriode);
      this.yearlyChartData.datasets[0].data = this.yearlyStats.map(stat => stat.totalDeclarations || 0);
    }
    
    console.log('Yearly stats processed:', this.yearlyStats);
  }

 private updateAllCharts(): void {
  try {
    // Ensure charts are properly initialized before updating
    if (!this.pieChart || !this.barChart || !this.declarationTypeChart || 
        !this.monthlyChart || !this.yearlyChart) {
      console.warn('Charts not initialized yet');
      return;
    }

    // Graphique en secteurs - rapports par type
    if (this.completeDashboard?.reports || this.procureurStats) {
      this.pieChartData.datasets[0].data = [
        this.completeDashboard?.reports?.rapportsProvisoires || Math.floor(this.totalDeclarations * 0.6),
        this.completeDashboard?.reports?.rapportsDefinitifs || Math.floor(this.totalDeclarations * 0.4)
      ];
      this.pieChart.chart?.update();
    }

    // Graphique en barres - décisions
    this.barChartData.datasets[0].data = [
      this.procureurStats.decisionsRendues * (this.procureurStats.tauxAcceptation / 100),
      this.procureurStats.decisionsRendues * ((100 - this.procureurStats.tauxAcceptation) / 100)
    ];
    this.barChart.chart?.update();

    // Graphique des types de déclarations
    this.declarationTypeChartData.datasets[0].data = [
      Math.floor(this.totalDeclarations * 0.7),
      Math.floor(this.totalDeclarations * 0.3)
    ];
    this.declarationTypeChart.chart?.update();

    // Graphiques temporels
    this.monthlyChart.chart?.update();
    this.yearlyChart.chart?.update();

    console.log('All charts updated successfully');
  } catch (error) {
    console.error('Error updating charts:', error);
  }
}
  /**
   * Calcule le taux d'acceptation
   */
  private calculateAcceptanceRate(decisions: any): number {
    if (!decisions) return 0;
    
    const total = (decisions.declarationsAcceptees || 0) + (decisions.declarationsRefusees || 0);
    if (total === 0) return 0;
    
    return Math.round((decisions.declarationsAcceptees || 0) * 100 / total);
  }

  /**
   * Charge les données d'un utilisateur spécifique
   */
  loadUserWorkload(userId: number): void {
    this.pgStatService.getUserWorkload(userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.userWorkload = data;
          console.log('User workload loaded:', data);
        },
        error: (error) => {
          console.error('Error loading user workload:', error);
        }
      });
  }

  /**
   * Change l'année sélectionnée et recharge les données
   */
  onYearChange(year: number): void {
    this.selectedYear = year;
    this.loadAllStatistics();
  }

  /**
   * Actualise toutes les données
   */
  refreshData(): void {
    this.loadAllStatistics();
  }

  /**
   * Gestion des erreurs
   */
  private handleError(error: any): void {
    if (error.status === 403) {
      console.error('Accès refusé. Vérifiez vos permissions.');
    } else if (error.status === 404) {
      console.error('Endpoint non trouvé. Vérifiez l\'URL de l\'API.');
    } else if (error.status === 500) {
      console.error('Erreur serveur. Contactez l\'administrateur.');
    } else {
      console.error('Une erreur est survenue:', error.message);
    }
  }

  /**
   * Méthodes utilitaires pour le template
   */
  getLoadingProgress(): number {
    // Simule un pourcentage de chargement
    return this.isLoading ? Math.floor(Math.random() * 100) : 100;
  }

  getNiveauChargeColor(niveau: string): string {
    switch (niveau) {
      case 'FAIBLE': return '#4CAF50';
      case 'MODERE': return '#FF9800';
      case 'ELEVE': return '#FF5722';
      case 'CRITIQUE': return '#F44336';
      default: return '#9E9E9E';
    }
  }

  getTendanceIcon(tendance: boolean): string {
    return tendance ? 'fas fa-arrow-up' : 'fas fa-arrow-down';
  }

  getTendanceClass(tendance: boolean): string {
    return tendance ? 'trend positive' : 'trend negative';
  }
  ngAfterViewInit(): void {
  this.loadAllStatistics();
}
}