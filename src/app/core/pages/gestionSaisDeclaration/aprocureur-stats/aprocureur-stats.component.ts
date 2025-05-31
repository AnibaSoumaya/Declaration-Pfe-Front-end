import { Component, OnInit, ViewChild } from '@angular/core';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { PgstatService } from 'src/app/core/services/pgstat.service';
import { BaseChartDirective } from 'ng2-charts';

@Component({
  selector: 'app-procureur-stats',
  templateUrl: './Aprocureur-stats.component.html',
  styleUrls: ['./Aprocureur-stats.component.scss']
})
// Fixed ProcureurStatsComponent
export class ProcureurStatsComponent implements OnInit {

  @ViewChild('pieChart') pieChart!: BaseChartDirective;
  @ViewChild('barChart') barChart!: BaseChartDirective;
  @ViewChild('horizontalBarChart') horizontalBarChart!: BaseChartDirective;
  @ViewChild('declarationTypeChart') declarationTypeChart!: BaseChartDirective;

  // Color palettes
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
    labels: ['Initiales', 'Mises à jour'],
    datasets: [{
      data: [0, 0],
      backgroundColor: [this.orangeColors[0], this.greenColors[0]],
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
    
    // Load dashboard statistics
    this.pgStatService.getDashboardStats().subscribe({
      next: (data) => {
        console.log('Dashboard data received:', data);
        this.processDashboardData(data);
        this.updateChartsWithData(data);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading dashboard statistics:', error);
        this.handleError(error);
        this.isLoading = false;
      }
    });
  }

  private processDashboardData(data: any): void {
    try {
      // Extract total declarations
      this.totalDeclarations = data?.declarations?.total || 0;
      
      // Process stats for the dashboard cards
      this.procureurStats = {
        dossiersEnCours: data?.workflow?.dossiersEnCours || 0,
        decisionsRendues: (data?.decisions?.declarationsAcceptees || 0) + (data?.decisions?.declarationsRefusees || 0),
        tauxAcceptation: this.calculateAcceptanceRate(data?.decisions),
        nouvellesDeclarations: data?.workflow?.nouveauxDossiers || 0,
        dossiersClotures: data?.workflow?.dossiersTermines || 0,
        sanctionsAppliquees: data?.decisions?.declarationsRefusees || 0,
        tendancePositive: true // You can calculate this based on historical data
      };
      
      console.log('Processed procureur stats:', this.procureurStats);
    } catch (error) {
      console.error('Error processing dashboard data:', error);
    }
  }

  private calculateAcceptanceRate(decisions: any): number {
    if (!decisions) return 0;
    
    const total = (decisions.declarationsAcceptees || 0) + (decisions.declarationsRefusees || 0);
    if (total === 0) return 0;
    
    return Math.round((decisions.declarationsAcceptees || 0) * 100 / total);
  }

  

  private updateChartsWithData(data: any): void {
    try {
      // Update pie chart - Reports by type
      if (data?.reports) {
        this.pieChartData.datasets[0].data = [
          data.reports.rapportsProvisoires || 0, 
          data.reports.rapportsDefinitifs || 0
        ];
        this.pieChart?.update();
      }

      // Update bar chart - Decisions
      if (data?.decisions) {
        this.barChartData.datasets[0].data = [
          data.decisions.declarationsAcceptees || 0, 
          data.decisions.declarationsRefusees || 0
        ];
        this.barChart?.update();
      }

      // Update line chart - Monthly evolution (generate sample data since temporal data might not be available)


     
      // Update declaration type chart
      if (data?.declarations) {
        this.declarationTypeChartData.datasets[0].data = [
          data.declarations.initiales || 0,
          data.declarations.misesAJour || 0
        ];
        this.declarationTypeChart?.update();
      }

      console.log('Charts updated successfully');
    } catch (error) {
      console.error('Error updating charts:', error);
    }
  }


  private generateSampleMonthlyData(): number[] {
    // Generate sample data based on total declarations
    const baseValue = Math.floor(this.totalDeclarations / 12);
    return Array.from({ length: 12 }, (_, i) => 
      baseValue + Math.floor(Math.random() * 10) - 5
    );
  }

  private handleError(error: any): void {
    if (error.status === 403) {
      console.error('Access denied. Please check your permissions.');
      // You might want to redirect to login or show an error message
    } else if (error.status === 404) {
      console.error('Endpoint not found. Please check the API URL.');
    } else {
      console.error('An error occurred:', error.message);
    }
  }

  refreshData(): void {
    this.loadProcureurStatistics();
  }
}
