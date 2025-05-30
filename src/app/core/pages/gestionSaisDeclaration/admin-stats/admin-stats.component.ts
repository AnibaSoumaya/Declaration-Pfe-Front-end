import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { StatisticsService } from 'src/app/core/services/statistique.service';
import { BaseChartDirective } from 'ng2-charts';
import { AdminstatService } from 'src/app/core/services/adminstat.service';

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

  updateCharts(data: any): void {
    // Graphique des utilisateurs par rôle
    this.updatePerformanceChart(data.usersByRole || {});
    
    // Graphique des déclarations par état
    this.updateEtatChart(data.declarationsByEtat || {});
    
  }

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
          '#4CAF50',
          '#2196F3',
          '#FF9800',
          '#9C27B0',
          '#F44336'
        ],
        borderColor: [
          '#45a049',
          '#1976D2',
          '#F57C00',
          '#7B1FA2',
          '#D32F2F'
        ],
        borderWidth: 2
      }]
    };
  }

  updateEtatChart(declarationsByEtat: any): void {
    const labels = Object.keys(declarationsByEtat);
    const values = Object.values(declarationsByEtat) as number[];
    
    if (labels.length === 0) {
      // Si pas de déclarations, afficher un message
      this.etatChartData = null;
      return;
    }
    
    this.etatChartData = {
      labels: labels,
      datasets: [{
        data: values,
        backgroundColor: [
          '#4CAF50',
          '#2196F3',
          '#FF9800',
          '#F44336',
          '#9C27B0'
        ],
        borderColor: [
          '#45a049',
          '#1976D2',
          '#F57C00',
          '#D32F2F',
          '#7B1FA2'
        ],
        borderWidth: 2
      }]
    };
  }

  updatePeriodeChart(declarationsByYear: any): void {
    const years = Object.keys(declarationsByYear);
    const counts = Object.values(declarationsByYear) as number[];
    
    if (years.length === 0) {
      // Données de démonstration si pas de données
      this.periodeChartData = {
        labels: ['2023', '2024', '2025'],
        datasets: [{
          label: 'Déclarations par année',
          data: [0, 0, 0],
          borderColor: '#2196F3',
          backgroundColor: 'rgba(33, 150, 243, 0.1)',
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
          borderColor: '#2196F3',
          backgroundColor: 'rgba(33, 150, 243, 0.1)',
          tension: 0.4,
          fill: true
        }]
      };
    }
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
}