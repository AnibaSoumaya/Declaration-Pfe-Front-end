import { Component, OnInit, ViewChild } from '@angular/core';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { AdminstatService } from 'src/app/core/services/adminstat.service';
import { BaseChartDirective } from 'ng2-charts';

@Component({
  selector: 'app-admin-stats',
  templateUrl: './admin-stats.component.html',
  styleUrls: ['./admin-stats.component.scss']
})
export class AdminStatsComponent implements OnInit {
  @ViewChild('performanceChart') performanceChart?: BaseChartDirective;
  @ViewChild('etatChart') etatChart?: BaseChartDirective;
  @ViewChild('periodeChart') periodeChart?: BaseChartDirective;

  // Données principales
  dashboardStats: any = {};
  loading = true;

  // Couleurs personnalisées
  private orangePalette = [
    '#FF6D00', '#FF9100', '#FFAB00', '#FFC400', '#FFD740', // Orange vifs
    '#FFE0B2', '#FFF3E0' // Orange clairs
  ];

  private greenPalette = [
    '#00C853', '#64DD17', '#AEEA00', // Verts vifs
    '#B9F6CA', '#CCFF90' // Verts clairs
  ];

  // Graphique des performances utilisateurs
  public performanceChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.8)',
        bodyFont: { size: 14 },
        titleFont: { size: 16, weight: 'bold' }
      }
    },
    scales: {
      y: { 
        beginAtZero: true,
        grid: { color: 'rgba(0,0,0,0.05)' },
        ticks: { color: '#5D4037' }
      },
      x: {
        grid: { display: false },
        ticks: { color: '#5D4037' }
      }
    },
    animation: {
      duration: 2000,
      easing: 'easeOutQuart'
    }
  };

  public performanceChartType: ChartType = 'bar';
  public performanceChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [{
      data: [],
      label: 'Activité',
      backgroundColor: this.orangePalette[0],
      hoverBackgroundColor: this.orangePalette[1],
      borderColor: '#FFF',
      borderWidth: 2,
      borderRadius: 4
    }]
  };

// Pour le graphique en doughnut (remplacer les anciennes options)
public etatChartOptions: ChartConfiguration['options'] = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { 
      position: 'right',
      labels: {
        font: { size: 12 },
        usePointStyle: true,
        padding: 16
      }
    }
  },
  //cutout: '65%',
  animation: {
    duration: 1000,
    easing: 'easeOutQuart',
    //animateRotate: true,  // Animation de rotation pour le doughnut
    //animateScale: true    // Maintenant correct dans Chart.js 3+
  }
};

  public etatChartType: ChartType = 'doughnut';
  public etatChartData: ChartData<'doughnut'> = {
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: [],
      hoverOffset: 8,
      borderColor: '#FFF',
      borderWidth: 3
    }]
  };

  // Graphique évolution par période
  public periodeChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      y: { 
        beginAtZero: true,
        grid: { color: 'rgba(0,0,0,0.05)' },
        ticks: { color: '#5D4037' }
      },
      x: {
        grid: { display: false },
        ticks: { color: '#5D4037' }
      }
    },
    elements: {
      point: {
        radius: 6,
        hoverRadius: 10,
        backgroundColor: this.orangePalette[0],
        borderColor: '#FFF',
        borderWidth: 2
      },
      line: {
        tension: 0.4,
        borderWidth: 3
      }
    },
    animation: {
      duration: 2000,
      easing: 'easeOutQuart'
    }
  };

  public periodeChartType: ChartType = 'line';
  public periodeChartData: ChartData<'line'> = {
    labels: [],
    datasets: [{
      data: [],
      label: 'Évolution',
      borderColor: this.greenPalette[0],
      backgroundColor: 'rgba(100, 221, 23, 0.1)',
      fill: true,
      pointBackgroundColor: this.orangePalette[0],
      pointBorderColor: '#FFF'
    }]
  };

  constructor(private statsService: AdminstatService) { }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;
    
    // Chargement des stats principales
    this.statsService.getDashboardStats().subscribe({
      next: (data) => {
        this.dashboardStats = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur stats dashboard:', err);
        this.loading = false;
      }
    });

    // Stats utilisateurs
    this.statsService.getUserStatistics().subscribe({
      next: (data) => {
        if (data?.usersActivity) {
          this.performanceChartData.labels = data.usersActivity.map((u: any) => u.name);
          this.performanceChartData.datasets[0].data = data.usersActivity.map((u: any) => u.count);
          this.performanceChart?.update();
        }
      },
      error: (err) => console.error('Erreur stats utilisateurs:', err)
    });

    // Stats déclarations
    this.statsService.getDeclarationStatistics().subscribe({
      next: (data) => {
        if (data?.byStatus) {
          this.etatChartData.labels = data.byStatus.map((s: any) => s.status);
          this.etatChartData.datasets[0].data = data.byStatus.map((s: any) => s.count);
          this.etatChartData.datasets[0].backgroundColor = data.byStatus.map(
            (_, i) => i % 2 === 0 ? this.orangePalette[i % 4] : this.greenPalette[i % 3]
          );
          this.etatChart?.update();
        }
      },
      error: (err) => console.error('Erreur stats déclarations:', err)
    });

    // Trends
    this.statsService.getDeclarationTrends().subscribe({
      next: (data) => {
        if (data?.monthlyTrends) {
          this.periodeChartData.labels = data.monthlyTrends.map((t: any) => t.month);
          this.periodeChartData.datasets[0].data = data.monthlyTrends.map((t: any) => t.count);
          this.periodeChart?.update();
        }
      },
      error: (err) => console.error('Erreur trends déclarations:', err)
    });
  }

  refreshData(): void {
    this.loadDashboardData();
  }
}