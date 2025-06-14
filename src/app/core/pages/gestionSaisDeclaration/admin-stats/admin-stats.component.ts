import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { StatisticsService } from 'src/app/core/services/statistique.service';
import { BaseChartDirective } from 'ng2-charts';
import { AdminstatService } from 'src/app/core/services/adminstat.service';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import * as moment from 'moment';
@Component({
  selector: 'app-admin-stats',
  templateUrl: './admin-stats.component.html',
  styleUrls: ['./admin-stats.component.scss']
})
export class AdminStatsComponent  implements OnInit {
  loading = false;
  dashboardStats: any = {};
  
  // Chart data properties
  performanceChartData: any;
  performanceChartType = 'bar';
  performanceChartOptions: any;
  
  etatChartData: any;
  etatChartType = 'doughnut';
  etatChartOptions: any;
  
  periodeChartData: any;
  periodeChartType = 'line';
  periodeChartOptions: any;

  constructor(private adminstatService: AdminstatService) {
    this.initializeChartOptions();
  }

  ngOnInit(): void {
    this.loadDashboardData();
  this.loadPerformanceData(); 

  }

  loadDashboardData(): void {
    this.loading = true;
    
    this.adminstatService.getDashboardStats().subscribe({
      next: (response) => {
        console.log('API Response:', response);
        this.processDashboardData(response);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading dashboard data:', error);
        this.loading = false;
      }
    });
  }

  processDashboardData(data: any): void {
    // Traitement direct des données selon la structure de votre console
    this.dashboardStats = {
      // Données principales
      totalDeclarations: data.totalDeclarations || 0,
      activeUsers: data.activeUsers || 0,
      totalUsers: data.totalUsers || 0,
      archivedUsers: data.archivedUsers || 0,
      totalAssujettis: data.totalAssujettis || 0,
      activeAssujettis: data.activeAssujettis || 0,
      archivedAssujettis: data.archivedAssujettis || 0,
      totalTerms: data.totalTerms || 0,
      
      // Données détaillées
      usersByRole: data.usersByRole || {},
      assujettisByEtat: data.assujettisByEtat || {},
      assujettisByYear: data.assujettisByYear || {},
      declarationsByEtat: data.declarationsByEtat || {},
      declarationsByType: data.declarationsByType || {},
      declarationsByYear: data.declarationsByYear || {},
      termsByType: data.termsByType || {},
      
      // Calculs
      processRate: this.calculateProcessRate(data),
      avgProcessTime: data.avgProcessTime || 0,
      recentActivity: this.generateRecentActivity(data)
    };

    console.log('Processed dashboard stats:', this.dashboardStats);

    // Mise à jour des graphiques
    this.updateCharts(data);
  }

  calculateProcessRate(data: any): number {
    const total = data.totalDeclarations || 0;
    if (total === 0) return 0;
    
    const byEtat = data.declarationsByEtat || {};
    const processed = Object.values<number>(byEtat)
      .reduce((sum: number, count: number) => sum + count, 0);
    
    return total > 0 ? Math.round((processed / total) * 100) : 0;
  }

  generateRecentActivity(data: any): any[] {
    const activities = [];
    
    if (data.totalUsers > 0) {
      activities.push({
        type: 'user',
        description: `${data.totalUsers} utilisateurs dans le système`,
        user: 'Système',
        time: 'Il y a 2 heures'
      });
    }
    
    if (data.totalAssujettis > 0) {
      activities.push({
        type: 'assujetti',
        description: `${data.totalAssujettis} assujettis enregistrés`,
        user: 'Système',
        time: 'Il y a 4 heures'
      });
    }
    
    if (data.totalTerms > 0) {
      activities.push({
        type: 'vocabulary',
        description: `${data.totalTerms} termes dans le vocabulaire`,
        user: 'Système',
        time: 'Il y a 6 heures'
      });
    }
    
    return activities;
  }
// Mettez à jour la méthode updatePerformanceChart
updatePerformanceChart(usersByRole: any): void {
  const roles = Object.keys(usersByRole);
  const counts = Object.values(usersByRole) as number[];
  
  if (roles.length === 0) {
    this.performanceChartData = null;
    return;
  }
  
  this.performanceChartData = {
    labels: roles.map(role => this.formatRoleName(role)),
    datasets: [{
      label: 'Nombre d\'utilisateurs',
      data: counts,
      backgroundColor: [
        'rgba(99, 175, 250, 0.7)', // Bleu pastel
        'rgba(141, 248, 141, 0.7)', // Vert pastel
        'rgba(255, 185, 114, 0.7)', // Orange pastel
        'rgba(207, 167, 251, 0.7)', // Violet pastel
        'rgba(254, 123, 123, 0.7)'  // Rouge pastel
      ],
      borderColor: [
        'rgb(49, 151, 253)',
        'rgb(47, 245, 47)',
        'rgb(240, 143, 45)',
        'rgb(178, 104, 252)',
        'rgb(255, 95, 95)'
      ],
      borderWidth: 1
    }]
  };
}

// Mettez à jour la méthode updateEtatChart
updateEtatChart(declarationsByEtat: any): void {
  const labels = Object.keys(declarationsByEtat);
  const values = Object.values(declarationsByEtat) as number[];
  
  if (labels.length === 0) {
    this.etatChartData = null;
    return;
  }
  
  this.etatChartData = {
    labels: labels,
    datasets: [{
      data: values,
      backgroundColor: [
        'rgba(116, 253, 116, 0.7)', // Vert pastel
        'rgba(92, 173, 253, 0.7)', // Bleu pastel
        'rgba(252, 213, 95, 0.7)', // Jaune pastel
        'rgba(253, 102, 102, 0.7)', // Rose pastel
        'rgba(132, 132, 250, 0.7)'  // Lavande pastel
      ],
      borderColor: [
        'rgb(48, 252, 48)',
        'rgb(50, 151, 251)',
        'rgb(249, 193, 25)',
        'rgb(255, 80, 80)',
        'rgb(120, 120, 250)'
      ],
      borderWidth: 1
    }]
  };
}

// Mettez à jour la méthode updatePeriodeChart
updatePeriodeChart(declarationsByYear: any): void {
  const years = Object.keys(declarationsByYear);
  const counts = Object.values(declarationsByYear) as number[];
  
  if (years.length === 0) {
    this.periodeChartData = {
      labels: ['2023', '2024', '2025'],
      datasets: [{
        label: 'Déclarations par année',
        data: [0, 0, 0],
        borderColor: 'rgb(86, 170, 253)',
        backgroundColor: 'rgba(0, 123, 246, 0.2)',
        tension: 0.4,
        fill: true
      }]
    };
  } else {
    this.periodeChartData = {
      labels: years,
      datasets: [{
        label: 'Déclarations par année',
        data: counts,
        borderColor: 'rgb(109, 181, 253)',
        backgroundColor: 'rgba(0, 128, 255, 0.2)',
        tension: 0.4,
        fill: true
      }]
    };
  }
}

// Mettez à jour la méthode processPerformanceData
processPerformanceData(stats: any): void {
  this.monthlyPerformanceData = {
    labels: stats.monthlyPerformance.map(m => this.getMonthName(m.month)),
    datasets: [
      {
        label: 'Déclarations totales',
        data: stats.monthlyPerformance.map(m => m.totalDeclarations),
        backgroundColor: 'rgba(178, 255, 178, 0.5)', // Vert pastel
        borderColor: 'rgba(102, 255, 102, 1)',
        borderWidth: 1
      },
      {
        label: 'Déclarations finales',
        data: stats.monthlyPerformance.map(m => m.finalDeclarations),
        backgroundColor: 'rgba(153, 204, 255, 0.5)', // Bleu pastel
        borderColor: 'rgba(102, 178, 255, 1)',
        borderWidth: 1
      }
    ]
  };

  this.yearlyPerformanceData = {
    labels: stats.yearlyPerformance.map(y => y.year.toString()),
    datasets: [
      {
        label: 'Déclarations totales',
        data: stats.yearlyPerformance.map(y => y.totalDeclarations),
        backgroundColor: 'rgba(255, 229, 153, 0.5)', // Jaune pastel
        borderColor: 'rgba(255, 204, 51, 1)',
        borderWidth: 1
      },
      {
        label: 'Déclarations finales',
        data: stats.yearlyPerformance.map(y => y.finalDeclarations),
        backgroundColor: 'rgba(229, 204, 255, 0.5)', // Violet pastel
        borderColor: 'rgba(204, 153, 255, 1)',
        borderWidth: 1
      }
    ]
  };

  this.performanceRate = stats.globalPerformanceRate;
}
  updateCharts(data: any): void {
    // Graphique des utilisateurs par rôle
    this.updatePerformanceChart(data.usersByRole || {});
    
    // Graphique des déclarations par état
    this.updateEtatChart(data.declarationsByEtat || {});
    
  }

  formatRoleName(role: string): string {
    const roleNames: { [key: string]: string } = {
      'verificateur': 'Vérificateur',
      'procureur_general': 'Procureur Général',
      'conseiller_rapporteur': 'Conseiller Rapporteur',
      'administrateur': 'Administrateur'
    };
    return roleNames[role] || role;
  }

  initializeChartOptions(): void {
    this.performanceChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1
          }
        }
      }
    };

    this.etatChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    };

    this.periodeChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true
        }
      },
      scales: {
        y: {
          beginAtZero: true
        }
      }
    };
  }

  refreshData(): void {
    this.loadDashboardData();
  }

  getActivityClass(type: string): string {
    const classes: { [key: string]: string } = {
      'user': 'activity-user',
      'assujetti': 'activity-assujetti',
      'declaration': 'activity-declaration',
      'vocabulary': 'activity-vocabulary'
    };
    return classes[type] || 'activity-default';
  }

  getActivityIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'user': 'fas fa-user',
      'assujetti': 'fas fa-user-tie',
      'declaration': 'fas fa-file-alt',
      'vocabulary': 'fas fa-book'
    };
    return icons[type] || 'fas fa-info-circle';
  }
  

  // Ajoutez ces nouvelles propriétés
  selectedYear: number = new Date().getFullYear();
  years: number[] = [];
  monthlyStats: any = {};
  yearlyStats: any = {};
  



  
  // Méthode pour exporter en PDF
  exportToPDF(): void {
    const element = document.querySelector('.dashboard-container') as HTMLElement;
    const filename = `statistiques_admin_${moment().format('YYYY-MM-DD')}.pdf`;
    
    html2canvas(element, {
      scale: 2,
      logging: true,
      useCORS: true,
      allowTaint: true
    }).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(filename);
    });
  }
// Dans admin-stats.component.ts

// Ajoutez ces propriétés
performanceStats: any | null = null;
monthlyPerformanceData: any;
yearlyPerformanceData: any;
topUsersData: any;
performanceRate: number = 0;

// Ajoutez ces méthodes
loadPerformanceData(): void {
  const currentYear = new Date().getFullYear();
  const endDate = new Date().toISOString().split('T')[0];
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 3);
  const startDateStr = startDate.toISOString().split('T')[0];

  this.loading = true;
  
  this.adminstatService.getPerformanceStatistics(currentYear, startDateStr, endDate)
    .subscribe({
      next: (stats) => {
        this.performanceStats = stats;
        this.processPerformanceData(stats);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading performance data:', error);
        this.loading = false;
      }
    });
}

getMonthName(monthNumber: number): string {
  const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 
                 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
  return months[monthNumber - 1];
}

}