import { Component, OnInit, ViewChild } from '@angular/core';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { PgstatService } from 'src/app/core/services/pgstat.service';
import { BaseChartDirective } from 'ng2-charts';

@Component({
  selector: 'app-procureur-stats',
  templateUrl: './Aprocureur-stats.component.html',
  styleUrls: ['./Aprocureur-stats.component.scss']
})
export class ProcureurStatsComponent implements OnInit {

  @ViewChild('pieChart') pieChart!: BaseChartDirective;
  @ViewChild('barChart') barChart!: BaseChartDirective;
  @ViewChild('lineChart') lineChart!: BaseChartDirective;
  @ViewChild('horizontalBarChart') horizontalBarChart!: BaseChartDirective;
  @ViewChild('declarationTypeChart') declarationTypeChart!: BaseChartDirective;

  // Nouvelle palette de couleurs orange/verte
  private orangeColors = [
    'rgba(255, 159, 64, 0.8)',   // Orange principal
    'rgba(255, 127, 36, 0.8)',   // Orange foncé
    'rgba(255, 183, 77, 0.8)',   // Orange clair
    'rgba(230, 81, 0, 0.8)',     // Orange profond
    'rgba(255, 152, 0, 0.8)'     // Orange vif
  ];

  private greenColors = [
    'rgba(75, 192, 192, 0.8)',   // Vert principal
    'rgba(56, 142, 60, 0.8)',    // Vert foncé
    'rgba(102, 187, 106, 0.8)',  // Vert clair
    'rgba(46, 125, 50, 0.8)',    // Vert profond
    'rgba(67, 160, 71, 0.8)'     // Vert vif
  ];

  procureurStats: any = {};
  totalDeclarations: number = 0;
  isLoading: boolean = true;

  // Graphique des rapports par type
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
          color: '#5a5a5a'
        }
      }
    }
  };
  public pieChartType: ChartType = 'pie';
  public pieChartData: ChartData<'pie'> = {
    labels: ['Provisoires', 'Définitifs'],
    datasets: [{
      data: [0, 0],
      backgroundColor: [this.orangeColors[0], this.greenColors[0]],
      borderWidth: 2,
      borderColor: '#ffffff'
    }]
  };

  // Graphique des décisions
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
  public barChartType: ChartType = 'bar';
  public barChartData: ChartData<'bar'> = {
    labels: ['Acceptées', 'Refusées'],
    datasets: [{
      data: [0, 0],
      label: 'Décisions',
      backgroundColor: [this.greenColors[0], this.orangeColors[0]],
      borderWidth: 1,
      borderColor: [this.greenColors[1], this.orangeColors[1]]
    }]
  };

  // Graphique évolution des dépôts
  public lineChartOptions: ChartConfiguration['options'] = {
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
  public lineChartType: ChartType = 'line';
  public lineChartData: ChartData<'line'> = {
    labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'],
    datasets: [{
      data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      label: 'Dépôts mensuels',
      borderColor: this.orangeColors[0],
      backgroundColor: this.orangeColors[0].replace('0.8', '0.2'),
      tension: 0.4,
      fill: true,
      pointBackgroundColor: this.orangeColors[0],
      pointBorderColor: '#ffffff',
      pointBorderWidth: 2
    }]
  };

  // Graphique par acteur
  public horizontalBarChartOptions: ChartConfiguration['options'] = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { 
        beginAtZero: true,
        grid: {
          color: 'rgba(0,0,0,0.05)'
        },
        ticks: {
          color: '#5a5a5a'
        }
      },
      y: {
        grid: {
          display: false
        },
        ticks: {
          color: '#5a5a5a'
        }
      }
    },
    plugins: {
      legend: { display: false }
    }
  };
  public horizontalBarChartType: ChartType = 'bar';
  public horizontalBarChartData: ChartData<'bar'> = {
    labels: ['Conseiller Rapporteur', 'Procureur Général', 'Avocat Général'],
    datasets: [{
      data: [0, 0, 0],
      backgroundColor: [
        this.orangeColors[0],
        this.greenColors[0],
        'rgba(153, 102, 255, 0.8)'
      ],
      borderWidth: 1,
      borderColor: [
        this.orangeColors[1],
        this.greenColors[1],
        'rgba(153, 102, 255, 1)'
      ]
    }]
  };

  // Graphique par type de déclaration
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
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: [...this.orangeColors, ...this.greenColors],
      borderWidth: 2,
      borderColor: '#ffffff'
    }]
  };

  constructor(private pgStatService: PgstatService) { }

  ngOnInit(): void {
    this.loadProcureurStatistics();
  }

  loadProcureurStatistics(): void {
    this.isLoading = true;
    
    // Statistiques du dashboard
    this.pgStatService.getDashboardStats().subscribe(data => {
      this.procureurStats = data;
      this.totalDeclarations = data.totalDeclarations;
      
      // Mise à jour des graphiques avec les données
      this.updateChartsWithData(data);
      
      this.isLoading = false;
    }, error => {
      console.error('Error loading statistics:', error);
      this.isLoading = false;
    });
  }

  private updateChartsWithData(data: any): void {
    // Rapports par type
    this.pieChartData.datasets[0].data = [data.reports.provisoires, data.reports.definitifs];
    this.pieChart?.update();

    // Décisions
    this.barChartData.datasets[0].data = [data.decisions.acceptees, data.decisions.refusees];
    this.barChart?.update();

    // Évolution des dépôts
    this.lineChartData.datasets[0].data = data.temporal.monthlyValues;
    this.lineChart?.update();

    // Par acteur
    this.horizontalBarChartData.datasets[0].data = [
      data.actors.conseillerRapporteur,
      data.actors.procureurGeneral,
      data.actors.avocatGeneral
    ];
    this.horizontalBarChart?.update();

    // Types de déclaration
    this.declarationTypeChartData.labels = data.declarationTypes.map((item: any) => item.type);
    this.declarationTypeChartData.datasets[0].data = data.declarationTypes.map((item: any) => item.count);
    this.declarationTypeChart?.update();
  }

  refreshData(): void {
    this.loadProcureurStatistics();
  }
}