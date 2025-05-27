import { Component, OnInit } from '@angular/core';
import { StatisticsService } from 'src/app/core/services/statistique.service';
import { UserService } from 'src/app/core/services/user.service';

@Component({
  selector: 'app-avocat-stats',
  templateUrl: './avocat-stats.component.html',
  styleUrls: ['./avocat-stats.component.scss']
})
export class AvocatStatsComponent implements OnInit {
  currentUserId: number = 0;
  avocatStats: any = {};

  constructor(
    private statisticsService: StatisticsService,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    this.getCurrentUser();
  }

  getCurrentUser(): void {
    this.userService.getCurrentUser().subscribe({
      next: (user) => {
        this.currentUserId = user.id;
        this.loadAvocatStatistics();
      },
      error: (err) => {
        console.error('Error getting current user:', err);
        this.currentUserId = 1; // Valeur par défaut pour le test
        this.loadAvocatStatistics();
      }
    });
  }

  loadAvocatStatistics(): void {
    this.statisticsService.getStatsForAvocatGeneral(this.currentUserId).subscribe(data => {
      this.avocatStats = {
        dossiersEnAttente: data.dossiersEnAttente || 0,
        delaiMoyen: data.delaiMoyen || 0
      };
    });
  }
}