import { Component, OnInit, ViewChild } from '@angular/core';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { StatisticsService } from 'src/app/core/services/statistique.service';
import { BaseChartDirective } from 'ng2-charts';

@Component({
  selector: 'app-procureur-stats',
  templateUrl: './aprocureur-stats.component.html',
  styleUrls: ['./aprocureur-stats.component.scss']
})
export class ProcureurStatsComponent implements OnInit {

  @ViewChild('pieChart') pieChart!: BaseChartDirective;
  @ViewChild('barChart') barChart!: BaseChartDirective;
  @ViewChild('lineChart') lineChart!: BaseChartDirective;
  @ViewChild('horizontalBarChart') horizontalBarChart!: BaseChartDirective;
  @ViewChild('declarationTypeChart') declarationTypeChart!: BaseChartDirective;

  // Couleurs personnalisées
  private blueColors = [
    'rgba(54, 162, 235, 0.8)',   // Bleu principal
    'rgba(25, 130, 210, 0.8)',   // Bleu foncé
    'rgba(100, 180, 255, 0.8)',  // Bleu clair
    'rgba(70, 130, 180, 0.8)',   // Bleu acier
    'rgba(0, 105, 180, 0.8)'     // Bleu royal
  ];

  private redColors = [
    'rgba(255, 99, 132, 0.8)',   // Rouge principal
    'rgba(220, 60, 90, 0.8)',     // Rouge foncé
    'rgba(255, 130, 150, 0.8)',   // Rouge clair
    'rgba(200, 40, 70, 0.8)',     // Rouge bordeaux
    'rgba(255, 80, 100, 0.8)'     // Rouge vif
  ];

  procureurStats: any = {};
  totalDeclarations: number = 0;

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
          padding: 20
        }
      }
    }
  };
  public pieChartType: ChartType = 'pie';
  public pieChartData: ChartData<'pie'> = {
    labels: ['Provisoires', 'Définitifs'],
    datasets: [{
      data: [0, 0],
      backgroundColor: [this.blueColors[0], this.redColors[0]],
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
  public barChartType: ChartType = 'bar';
  public barChartData: ChartData<'bar'> = {
    labels: ['Acceptées', 'Refusées'],
    datasets: [{
      data: [0, 0],
      label: 'Décisions',
      backgroundColor: ['rgba(75, 192, 192, 0.8)', 'rgba(255, 99, 132, 0.8)'],
      borderWidth: 1,
      borderColor: ['rgba(75, 192, 192, 1)', 'rgba(255, 99, 132, 1)']
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
  public lineChartType: ChartType = 'line';
  public lineChartData: ChartData<'line'> = {
    labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'],
    datasets: [{
      data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      label: 'Dépôts mensuels',
      borderColor: this.blueColors[0],
      backgroundColor: this.blueColors[0].replace('0.8', '0.2'),
      tension: 0.4,
      fill: true,
      pointBackgroundColor: this.blueColors[0],
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
          color: 'rgba(0,0,0,0.1)'
        }
      },
      y: {
        grid: {
          display: false
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
        this.blueColors[0],
        this.redColors[0],
        'rgba(255, 206, 86, 0.8)'
      ],
      borderWidth: 1,
      borderColor: [
        this.blueColors[1],
        this.redColors[1],
        'rgba(255, 206, 86, 1)'
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
          padding: 15
        }
      }
    }
  };
  public declarationTypeChartType: ChartType = 'doughnut';
  public declarationTypeChartData: ChartData<'doughnut'> = {
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: [...this.blueColors, ...this.redColors],
      borderWidth: 2,
      borderColor: '#ffffff'
    }]
  };

  constructor(private statisticsService: StatisticsService) { }

  ngOnInit(): void {
    this.loadProcureurStatistics();
  }

  loadProcureurStatistics(): void {
    // Statistiques générales procureur
    this.statisticsService.getStatsForProcureurGeneral().subscribe(data => {
      this.procureurStats = data;
    });

    // Total déclarations
    this.statisticsService.getTotalDeclarations().subscribe(total => {
      this.totalDeclarations = total;
    });

    // Rapports par type
    this.statisticsService.getReportsByType().subscribe(data => {
      this.pieChartData.datasets[0].data = [data.provisoires, data.definitifs];
      this.pieChart?.update();
    });

    // Statistiques de décisions
    this.statisticsService.getDecisionStats().subscribe(data => {
      this.barChartData.datasets[0].data = [data.acceptees, data.refusees];
      this.barChart?.update();
    });

    // Évolution des dépôts
    this.statisticsService.getDeclarationsTrend('monthly').subscribe(data => {
      this.lineChartData.datasets[0].data = data.values;
      this.lineChart?.update();
    });

    // Déclarations par acteur
    this.statisticsService.getDeclarationsByActor().subscribe(data => {
      this.horizontalBarChartData.datasets[0].data = [
        data.conseillerRapporteur,
        data.procureurGeneral,
        data.avocatGeneral
      ];
      this.horizontalBarChart?.update();
    });

    // Statistiques par type de déclaration
    this.statisticsService.getStatsByDeclarationType().subscribe(data => {
      this.declarationTypeChartData.labels = data.map((item: any) => item.type);
      this.declarationTypeChartData.datasets[0].data = data.map((item: any) => item.nombre);
      this.declarationTypeChart?.update();
    });
  }

  refreshData(): void {
    this.loadProcureurStatistics();
  }
}