import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { StatisticsService } from 'src/app/core/services/statistique.service';
import { UserService } from 'src/app/core/services/user.service';
import { BaseChartDirective } from 'ng2-charts';

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

  currentUserId: number = 0;
  conseillerStats: any = {
    tachesRecentes: [],
    dossiersAssignes: 0,
    dossiersTraites: 0,
    dossiersEnCours: 0,
    delaiMoyen: 0
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

  // Graphiques
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
    },
    animation: {
      //animateRotate: true,
      //animateScale: true
    }
  };
  
  public declarationsChartType: ChartType = 'pie';
  public declarationsChartData: ChartData<'pie'> = {
    labels: ['En cours', 'Terminées', 'En attente'],
    datasets: [{
      data: [0, 0, 0],
      backgroundColor: [
        this.orangeColors[0], // Orange pour "En cours"
        this.greenColors[0],  // Vert pour "Terminées"
        this.orangeColors[1]  // Orange clair pour "En attente"
      ],
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
    plugins: { 
      legend: { 
        display: true,
        position: 'top'
      }
    },
    elements: {
      point: {
        radius: 6,
        hoverRadius: 8
      }
    }
  };
  
  public performanceChartType: ChartType = 'line';
  public performanceChartData: ChartData<'line'> = {
    labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'],
    datasets: [{
      data: Array(12).fill(0),
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

  public tempsTraitementChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
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
    plugins: { 
      legend: { 
        display: true,
        position: 'top'
      }
    }
  };
  
  public tempsTraitementChartType: ChartType = 'bar';
  public tempsTraitementChartData: ChartData<'bar'> = {
    labels: ['< 7 jours', '7-14 jours', '14-21 jours', '> 21 jours'],
    datasets: [{
      data: [0, 0, 0, 0],
      label: 'Nombre de déclarations',
      backgroundColor: [
        this.greenColors[0],  // Vert pour rapide
        this.greenColors[1],  // Vert clair pour moyen
        this.orangeColors[0], // Orange pour lent
        this.orangeColors[2]  // Orange foncé pour très lent
      ],
      borderWidth: 1,
      borderColor: [
        this.greenColors[2],
        this.greenColors[3],
        this.orangeColors[2],
        this.orangeColors[4]
      ]
    }]
  };

  public typesChartOptions: ChartConfiguration['options'] = {
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
  
  public typesChartType: ChartType = 'doughnut';
  public typesChartData: ChartData<'doughnut'> = {
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: [...this.orangeColors, ...this.greenColors],
      borderWidth: 2,
      borderColor: '#ffffff'
    }]
  };

  constructor(
    private statisticsService: StatisticsService,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    this.getCurrentUser();
  }

  ngAfterViewInit(): void {
    // Attendre que la vue soit complètement initialisée
    setTimeout(() => {
      this.updateAllCharts();
    }, 100);
  }

  getCurrentUser(): void {
    this.userService.getCurrentUser().subscribe({
      next: (user) => {
        this.currentUserId = user.id;
        this.loadConseillerStatistics();
      },
      error: (err) => {
        console.error('Erreur lors de la récupération de l\'utilisateur:', err);
        this.currentUserId = 1;
        this.loadConseillerStatistics();
      }
    });
  }

  loadConseillerStatistics(): void {
    this.statisticsService.getStatsForConseillerRapporteur(this.currentUserId).subscribe({
      next: (data) => {
        this.conseillerStats = { ...data };

        // Mise à jour des données des graphiques
        if (data.declarationsParStatut) {
          this.declarationsChartData.datasets[0].data = [
            data.declarationsParStatut.enCours || 0,
            data.declarationsParStatut.terminees || 0,
            data.declarationsParStatut.enAttente || 0
          ];
        }

        if (data.performanceMensuelle) {
          this.performanceChartData.datasets[0].data = data.performanceMensuelle;
        }

        if (data.tempsTraitement) {
          this.tempsTraitementChartData.datasets[0].data = [
            data.tempsTraitement.rapide || 0,
            data.tempsTraitement.moyen || 0,
            data.tempsTraitement.lent || 0,
            data.tempsTraitement.tresLent || 0
          ];
        }

        if (data.typesDeclarations && data.typesDeclarations.length > 0) {
          this.typesChartData.labels = data.typesDeclarations.map((item: any) => item.type);
          this.typesChartData.datasets[0].data = data.typesDeclarations.map((item: any) => item.nombre);
          
          // Assigner les couleurs en alternant orange et vert
          this.typesChartData.datasets[0].backgroundColor = data.typesDeclarations.map((item: any, index: number) => {
            return index % 2 === 0 ? this.orangeColors[index % this.orangeColors.length] : this.greenColors[index % this.greenColors.length];
          });
        }

        // Forcer la mise à jour des graphiques
        setTimeout(() => {
          this.updateAllCharts();
        }, 50);
      },
      error: (err) => {
        console.error('Erreur lors du chargement des statistiques:', err);
      }
    });
  }

  private updateAllCharts(): void {
    try {
      if (this.declarationsChart) {
        this.declarationsChart.update();
      }
      if (this.performanceChart) {
        this.performanceChart.update();
      }
      if (this.tempsTraitementChart) {
        this.tempsTraitementChart.update();
      }
      if (this.typesChart) {
        this.typesChart.update();
      }
    } catch (error) {
      console.warn('Erreur lors de la mise à jour des graphiques:', error);
    }
  }

  // Méthode pour rafraîchir manuellement les données
  refreshData(): void {
    this.loadConseillerStatistics();
  }
}