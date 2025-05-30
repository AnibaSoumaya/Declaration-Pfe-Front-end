import { Component, OnInit } from '@angular/core';
import { AvocatGeneralStatisticsService } from 'src/app/core/services/avocat-general-statistics-service.service';
import { UserService } from 'src/app/core/services/user.service';

@Component({
  selector: 'app-avocat-stats',
  templateUrl: './avocat-stats.component.html',
  styleUrls: ['./avocat-stats.component.scss']
})
export class AvocatStatsComponent implements OnInit {
  currentUserId: number = 0;
  dashboardData: any = {};
  isLoading: boolean = true;

  constructor(
    private avocatGeneralStatsService: AvocatGeneralStatisticsService,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    this.getCurrentUser();
  }

  getCurrentUser(): void {
    this.userService.getCurrentUser().subscribe({
      next: (user) => {
        this.currentUserId = user.id;
        this.loadDashboardData();
      },
      error: (err) => {
        console.error('Error getting current user:', err);
        this.currentUserId = 36; // Valeur par défaut pour le test
        this.loadDashboardData();
      }
    });
  }

 loadDashboardData(): void {
    this.isLoading = true;
    this.avocatGeneralStatsService.getDashboard(this.currentUserId).subscribe({
      next: (data) => {
        this.dashboardData = {
          statistiquesGlobales: data.statistiquesGlobales,
          chargeTravail: {
            nouvelles: data.chargeTravail.nouvelles,
            enCours: data.chargeTravail.enCours
          },
          conclusionStats: data.conclusionStats
        };
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading dashboard data:', err);
        this.isLoading = false;
        this.dashboardData = {
          statistiquesGlobales: {
            totalDeclarations: 0,
            conclusionsGenerees: 0,
            enAttenteConclusion: 0,
            commentairesAjoutes: 0,
            tauxTraitement: 0.0
          },
          chargeTravail: {
            nouvelles: 0,
            enCours: 0
          },
          conclusionStats: {
            totalConclusions: 0,
            acceptations: 0,
            refus: 0,
            tauxAcceptation: 0.0,
            tauxRefus: 0.0
          }
        };
      }
    });
  }

  getStatValue(path: string): any {
    const keys = path.split('.');
    let value = this.dashboardData;
    for (const key of keys) {
      value = value?.[key];
      if (value === undefined || value === null) {
        return 0;
      }
    }
    return value;
  }

  formatPercentage(value: number): string {
    return `${value.toFixed(1)}%`;
  }

  formatDays(value: number): string {
    return `${value.toFixed(1)} j`;
  }
}