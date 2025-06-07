import { Component, OnInit, ViewChild } from '@angular/core';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { PgstatService } from 'src/app/core/services/pgstat.service';
import { BaseChartDirective } from 'ng2-charts';
import * as jspdf from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-procureur-stats',
  templateUrl: './Aprocureur-stats.component.html',
  styleUrls: ['./Aprocureur-stats.component.scss']
})
export class ProcureurStatsComponent implements OnInit {

  @ViewChild('pieChart') pieChart!: BaseChartDirective;
  @ViewChild('barChart') barChart!: BaseChartDirective;
  @ViewChild('horizontalBarChart') horizontalBarChart!: BaseChartDirective;
  @ViewChild('declarationTypeChart') declarationTypeChart!: BaseChartDirective;

  // Pastel color palettes
  private orangeColors = [
    'rgba(255, 179, 102, 0.8)',   // Orange pastel
    'rgba(255, 153, 51, 0.8)',    // Orange pastel plus foncé
    'rgba(255, 204, 153, 0.8)',   // Orange pastel clair
    'rgba(255, 178, 102, 0.8)',   // Orange pastel moyen
    'rgba(255, 165, 79, 0.8)'     // Orange pastel doré
  ];

  private greenColors = [
    'rgba(144, 238, 144, 0.8)',    // Vert pastel clair
    'rgba(102, 205, 170, 0.8)',    // Vert pastel moyen
    'rgba(152, 251, 152, 0.8)',    // Vert pastel menthe
    'rgba(60, 179, 113, 0.8)',     // Vert pastel forêt
    'rgba(34, 139, 34, 0.8)'       // Vert pastel foncé
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

  // Pie chart configuration
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

  // Bar chart configuration
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

  // Line chart configuration
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

  // Doughnut chart configuration
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
    
    this.pgStatService.getDashboardStats().subscribe({
      next: (data) => {
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
      // Update pie chart
      if (data?.reports) {
        this.pieChartData.datasets[0].data = [
          data.reports.rapportsProvisoires || 0, 
          data.reports.rapportsDefinitifs || 0
        ];
        this.pieChart?.update();
      }

      // Update bar chart
      if (data?.decisions) {
        this.barChartData.datasets[0].data = [
          data.decisions.declarationsAcceptees || 0, 
          data.decisions.declarationsRefusees || 0
        ];
        this.barChart?.update();
      }

      // Update line chart
      if (data?.declarations?.monthly) {
        this.lineChartData.datasets[0].data = data.declarations.monthly;
        this.horizontalBarChart?.update();
      }

      // Update declaration type chart
      if (data?.declarations) {
        this.declarationTypeChartData.datasets[0].data = [
          data.declarations.initiales || 0,
          data.declarations.misesAJour || 0
        ];
        this.declarationTypeChart?.update();
      }
    } catch (error) {
      console.error('Error updating charts:', error);
    }
  }

  private handleError(error: any): void {
    if (error.status === 403) {
      console.error('Access denied. Please check your permissions.');
    } else if (error.status === 404) {
      console.error('Endpoint not found. Please check the API URL.');
    } else {
      console.error('An error occurred:', error.message);
    }
  }

  refreshData(): void {
    this.loadProcureurStatistics();
  }

  exportAsPDF(): void {
    const data = document.getElementById('dashboard-content')!;
    html2canvas(data).then(canvas => {
      const imgWidth = 208;
      const pageHeight = 295;
      const imgHeight = canvas.height * imgWidth / canvas.width;
      let heightLeft = imgHeight;
      
      const contentDataURL = canvas.toDataURL('image/png');
      const pdf = new jspdf.jsPDF('p', 'mm', 'a4');
      let position = 0;
      
      pdf.addImage(contentDataURL, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(contentDataURL, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      pdf.save('analyse_donnees.pdf');
    });
  }
}