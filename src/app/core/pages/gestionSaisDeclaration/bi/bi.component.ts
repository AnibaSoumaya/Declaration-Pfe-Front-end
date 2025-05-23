import { Component } from '@angular/core';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { StatisticsService } from 'src/app/core/services/statistique.service';

@Component({
  selector: 'app-bi',
  templateUrl: './bi.component.html',
  styleUrls: ['./bi.component.scss']
})
export class BIComponent {// Statistiques générales
  totalDeclarations: number = 0;
  
  // Pour le graphique en camembert des rapports par type
  public pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      }
    }
  };
  public pieChartType: ChartType = 'pie';
  public pieChartData: ChartData<'pie'> = {
    labels: ['Provisoires', 'Définitifs'],
    datasets: [{ 
      data: [0, 0],
      backgroundColor: ['rgba(54, 162, 235, 0.8)', 'rgba(255, 99, 132, 0.8)']
    }]
  };

  // Pour le graphique en barre des décisions (acceptées/refusées)
  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    scales: {
      x: {},
      y: {
        min: 0
      }
    },
    plugins: {
      legend: {
        display: true,
      }
    }
  };
  public barChartType: ChartType = 'bar';
  public barChartData: ChartData<'bar'> = {
    labels: ['Acceptées', 'Refusées'],
    datasets: [
      { data: [0, 0], label: 'Décisions', backgroundColor: ['rgba(75, 192, 192, 0.8)', 'rgba(255, 99, 132, 0.8)'] }
    ]
  };

  // Pour le graphique en ligne de l'évolution des dépôts
  public lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    scales: {
      x: {},
      y: {
        min: 0
      }
    },
    plugins: {
      legend: {
        display: true,
      }
    }
  };
  public lineChartType: ChartType = 'line';
  public lineChartData: ChartData<'line'> = {
    labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'],
    datasets: [
      { 
        data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
        label: 'Dépôts mensuels', 
        borderColor: 'rgba(54, 162, 235, 1)',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        tension: 0.4
      }
    ]
  };

  // Pour le graphique en barre horizontale des déclarations par acteur
  public horizontalBarChartOptions: ChartConfiguration['options'] = {
    indexAxis: 'y',
    responsive: true,
    scales: {
      x: {
        min: 0
      },
      y: {}
    },
    plugins: {
      legend: {
        display: false,
      }
    }
  };
  public horizontalBarChartType: ChartType = 'bar';
  public horizontalBarChartData: ChartData<'bar'> = {
    labels: ['Conseiller Rapporteur', 'Procureur Général', 'Avocat Général'],
    datasets: [
      { 
        data: [0, 0, 0], 
        backgroundColor: ['rgba(54, 162, 235, 0.8)', 'rgba(255, 99, 132, 0.8)', 'rgba(255, 206, 86, 0.8)'] 
      }
    ]
  };

  constructor(private statisticsService: StatisticsService) { }

  ngOnInit(): void {
    this.loadAllStatistics();
  }

  loadAllStatistics(): void {
    // Récupérer le nombre total de déclarations
    this.statisticsService.getTotalDeclarations().subscribe(total => {
      this.totalDeclarations = total;
    });

    // Récupérer les rapports par type
    this.statisticsService.getReportsByType().subscribe(data => {
      this.pieChartData.datasets[0].data = [data.provisoires, data.definitifs];
    });

    // Récupérer les statistiques de décisions
    this.statisticsService.getDecisionStats().subscribe(data => {
      this.barChartData.datasets[0].data = [data.acceptees, data.refusees];
    });

    // Récupérer l'évolution des dépôts par mois
    this.statisticsService.getDeclarationsTrend('monthly').subscribe(data => {
      this.lineChartData.datasets[0].data = data.values;
    });

    // Récupérer les déclarations par acteur
    this.statisticsService.getDeclarationsByActor().subscribe(data => {
      this.horizontalBarChartData.datasets[0].data = [
        data.conseillerRapporteur,
        data.procureurGeneral,
        data.avocatGeneral
      ];
    });
  }
}