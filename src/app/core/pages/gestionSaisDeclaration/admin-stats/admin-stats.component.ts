import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { StatisticsService } from 'src/app/core/services/statistique.service';
import { BaseChartDirective } from 'ng2-charts';

@Component({
  selector: 'app-admin-stats',
  templateUrl: './admin-stats.component.html',
  styleUrls: ['./admin-stats.component.scss']
})
export class AdminStatsComponent implements OnInit, AfterViewInit {

  @ViewChild('performanceChart') performanceChart!: BaseChartDirective;
  @ViewChild('etatChart') etatChart!: BaseChartDirective;
  @ViewChild('periodeChart') periodeChart!: BaseChartDirective;

  // Données générales
  totalDeclarations: number = 0;
  adminStats: any = {
    utilisateursActifs: 0
  };
  workflowStats: any = {
    tauxTraitement: 0,
    tempsMoyenTraitement: 0,
    dossiersEnRetard: 0
  };

  // Couleurs orange et verte personnalisées
  private orangeColors = [
    'rgba(255, 152, 0, 0.8)',   // Orange principal
    'rgba(255, 193, 7, 0.8)',   // Orange clair
    'rgba(255, 87, 34, 0.8)',   // Orange foncé
    'rgba(255, 183, 77, 0.8)',  // Orange moyen
    'rgba(230, 126, 34, 0.8)'   // Orange terre
  ];

  private greenColors = [
    'rgba(76, 175, 80, 0.8)',   // Vert principal
    'rgba(139, 195, 74, 0.8)',  // Vert clair
    'rgba(46, 125, 50, 0.8)',   // Vert foncé
    'rgba(102, 187, 106, 0.8)', // Vert moyen
    'rgba(67, 160, 71, 0.8)'    // Vert vif
  ];

  // Graphique des performances utilisateurs
  public performanceChartOptions: ChartConfiguration['options'] = {
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
    },
    scales: {
      y: { 
        beginAtZero: true,
        grid: {
          color: 'rgba(0,0,0,0.1)'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };

  public performanceChartType: ChartType = 'bar';
  public performanceChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [{
      data: [],
      label: 'Déclarations traitées',
      backgroundColor: this.greenColors[0],
      borderColor: this.greenColors[2],
      borderWidth: 2,
      hoverBackgroundColor: this.orangeColors[0],
      hoverBorderColor: this.orangeColors[2]
    }]
  };

  // Graphique des statistiques par état
  public etatChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        display: true, 
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 15
        }
      }
    },
    //cutout: '50%'
  };

  public etatChartType: ChartType = 'doughnut';
  public etatChartData: ChartData<'doughnut'> = {
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: [],
      borderWidth: 2,
      borderColor: '#ffffff',
      hoverOffset: 10
    }]
  };

  // Graphique évolution par période
  public periodeChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        display: true,
        position: 'top'
      }
    },
    scales: {
      y: { 
        beginAtZero: true,
        grid: {
          color: 'rgba(0,0,0,0.1)'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    },
    elements: {
      point: {
        radius: 6,
        hoverRadius: 8,
        backgroundColor: this.orangeColors[0],
        borderColor: '#ffffff',
        borderWidth: 2
      }
    }
  };

  public periodeChartType: ChartType = 'line';
  public periodeChartData: ChartData<'line'> = {
    labels: [],
    datasets: [{
      data: [],
      label: 'Évolution mensuelle',
      borderColor: this.greenColors[0],
      backgroundColor: this.greenColors[0].replace('0.8', '0.2'),
      tension: 0.4,
      fill: true,
      pointBackgroundColor: this.orangeColors[0],
      pointBorderColor: '#ffffff',
      pointBorderWidth: 2
    }]
  };

  constructor(private statisticsService: StatisticsService) { }

  ngOnInit(): void {
    this.loadAdminStatistics();
  }

  ngAfterViewInit(): void {
    // Attendre que la vue soit complètement initialisée
    setTimeout(() => {
      this.updateAllCharts();
    }, 100);
  }

  loadAdminStatistics(): void {
    // Statistiques générales admin
    this.statisticsService.getStatsForAdmin().subscribe({
      next: (data) => {
        this.adminStats = { ...data };
        this.updateAllCharts();
      },
      error: (err) => {
        console.error('Erreur lors du chargement des stats admin:', err);
      }
    });

    // Total déclarations
    this.statisticsService.getTotalDeclarations().subscribe({
      next: (total) => {
        this.totalDeclarations = total;
      },
      error: (err) => {
        console.error('Erreur lors du chargement du total:', err);
      }
    });

    // Performance des utilisateurs
    this.statisticsService.getPerformanceUtilisateurs().subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          this.performanceChartData.labels = data.map((item: any) => item.nomUtilisateur);
          this.performanceChartData.datasets[0].data = data.map((item: any) => item.nombreDeclarations);
          
          // Couleurs alternées pour chaque barre
          this.performanceChartData.datasets[0].backgroundColor = data.map((item: any, index: number) => {
            return index % 2 === 0 ? this.greenColors[index % this.greenColors.length] : this.orangeColors[index % this.orangeColors.length];
          });
        }
        setTimeout(() => this.updateChart('performance'), 50);
      },
      error: (err) => {
        console.error('Erreur lors du chargement des performances:', err);
      }
    });

    // Statistiques par état
    this.statisticsService.getStatsByEtat().subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          this.etatChartData.labels = data.map((item: any) => item.etat);
          this.etatChartData.datasets[0].data = data.map((item: any) => item.nombre);
          
          // Couleurs alternées orange et vert
          this.etatChartData.datasets[0].backgroundColor = data.map((item: any, index: number) => {
            return index % 2 === 0 ? this.orangeColors[index % this.orangeColors.length] : this.greenColors[index % this.greenColors.length];
          });
        }
        setTimeout(() => this.updateChart('etat'), 50);
      },
      error: (err) => {
        console.error('Erreur lors du chargement des stats par état:', err);
      }
    });

    // Statistiques par période
    this.statisticsService.getStatsByPeriode('monthly').subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          this.periodeChartData.labels = data.map((item: any) => item.periode);
          this.periodeChartData.datasets[0].data = data.map((item: any) => item.nombre);
        }
        setTimeout(() => this.updateChart('periode'), 50);
      },
      error: (err) => {
        console.error('Erreur lors du chargement des stats par période:', err);
      }
    });

    // Statistiques workflow
    this.statisticsService.getWorkflowStats().subscribe({
      next: (data) => {
        this.workflowStats = { ...data };
      },
      error: (err) => {
        console.error('Erreur lors du chargement des stats workflow:', err);
      }
    });
  }

  private updateAllCharts(): void {
    setTimeout(() => {
      this.updateChart('performance');
      this.updateChart('etat');
      this.updateChart('periode');
    }, 100);
  }

  private updateChart(chartType: string): void {
    try {
      switch (chartType) {
        case 'performance':
          if (this.performanceChart) {
            this.performanceChart.update();
          }
          break;
        case 'etat':
          if (this.etatChart) {
            this.etatChart.update();
          }
          break;
        case 'periode':
          if (this.periodeChart) {
            this.periodeChart.update();
          }
          break;
      }
    } catch (error) {
      console.warn(`Erreur lors de la mise à jour du graphique ${chartType}:`, error);
    }
  }

  // Méthode pour rafraîchir manuellement les données
  refreshData(): void {
    this.loadAdminStatistics();
  }
}