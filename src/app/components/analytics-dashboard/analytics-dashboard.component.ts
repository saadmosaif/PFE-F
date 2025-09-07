import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatsService, PortCallStat, VesselTypeStat, WaitingTimeStat } from '../../services/stats.service';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-analytics-dashboard',
  standalone: true,
  imports: [CommonModule, NgChartsModule],
  templateUrl: './analytics-dashboard.component.html',
  styleUrls: ['./analytics-dashboard.component.scss']
})
export class AnalyticsDashboardComponent implements OnInit {
  // Données pour les graphiques
  portCallStats: PortCallStat[] = [];
  vesselTypeStats: VesselTypeStat[] = [];
  waitingTimeStats: WaitingTimeStat[] = [];

  // Indicateurs de chargement
  loading = {
    portCalls: true,
    vesselTypes: true,
    waitingTimes: true
  };

  // Configuration du graphique d'escales par port
  portCallsChartData: ChartData<'line'> = {
    labels: [],
    datasets: []
  };

  portCallsChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      title: {
        display: true,
        text: 'Nombre d\'escales par port et par mois'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Nombre d\'escales'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Mois'
        }
      }
    }
  };

  // Configuration du graphique de types de navires
  vesselTypesChartData: ChartData<'pie'> = {
    labels: [],
    datasets: [{
      data: []
    }]
  };

  vesselTypesChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'right',
      },
      title: {
        display: true,
        text: 'Répartition des types de navires'
      }
    }
  };

  // Configuration du graphique de temps d'attente
  waitingTimesChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [{
      data: [],
      label: 'Temps moyen d\'attente (heures)',
      backgroundColor: 'rgba(53, 162, 235, 0.5)',
    }]
  };

  waitingTimesChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      title: {
        display: true,
        text: 'Temps moyen d\'attente par port'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Heures'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Port'
        }
      }
    }
  };

  constructor(private statsService: StatsService) { }

  ngOnInit(): void {
    this.loadAllStats();
  }

  /**
   * Charge toutes les statistiques en parallèle
   */
  loadAllStats(): void {
    forkJoin({
      portCalls: this.statsService.getPortCallStats(),
      vesselTypes: this.statsService.getVesselTypeStats(),
      waitingTimes: this.statsService.getWaitingTimeStats()
    }).subscribe({
      next: (results) => {
        this.portCallStats = results.portCalls;
        this.vesselTypeStats = results.vesselTypes;
        this.waitingTimeStats = results.waitingTimes;

        this.preparePortCallsChart();
        this.prepareVesselTypesChart();
        this.prepareWaitingTimesChart();

        this.loading = {
          portCalls: false,
          vesselTypes: false,
          waitingTimes: false
        };
      },
      error: (error) => {
        console.error('Erreur lors du chargement des statistiques', error);
        this.loading = {
          portCalls: false,
          vesselTypes: false,
          waitingTimes: false
        };
      }
    });
  }

  /**
   * Prépare les données pour le graphique d'escales par port
   */
  preparePortCallsChart(): void {
    // Extraire les mois uniques pour les labels
    const months = [...new Set(this.portCallStats.map(stat => stat.mois))];
    // Trier les mois dans l'ordre chronologique
    const sortedMonths = months.sort((a, b) => {
      const monthOrder = [
        'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
        'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
      ];
      return monthOrder.indexOf(a) - monthOrder.indexOf(b);
    });

    // Extraire les ports uniques
    const ports = [...new Set(this.portCallStats.map(stat => stat.port))];

    // Préparer les datasets pour chaque port
    const datasets = ports.map((port, index) => {
      const colors = [
        'rgba(255, 99, 132, 0.7)',
        'rgba(54, 162, 235, 0.7)',
        'rgba(255, 206, 86, 0.7)',
        'rgba(75, 192, 192, 0.7)',
        'rgba(153, 102, 255, 0.7)',
        'rgba(255, 159, 64, 0.7)'
      ];

      return {
        data: sortedMonths.map(month => {
          const stat = this.portCallStats.find(s => s.port === port && s.mois === month);
          return stat ? stat.total : 0;
        }),
        label: port,
        borderColor: colors[index % colors.length],
        backgroundColor: colors[index % colors.length].replace('0.7', '0.1'),
        borderWidth: 2,
        fill: true,
        tension: 0.2
      };
    });

    this.portCallsChartData = {
      labels: sortedMonths.map(month => this.formatMonth(month)),
      datasets
    };
  }

  /**
   * Prépare les données pour le graphique de types de navires
   */
  prepareVesselTypesChart(): void {
    const labels = this.vesselTypeStats.map(stat => stat.type);
    const data = this.vesselTypeStats.map(stat => stat.total);

    const backgroundColors = [
      'rgba(255, 99, 132, 0.7)',
      'rgba(54, 162, 235, 0.7)',
      'rgba(255, 206, 86, 0.7)',
      'rgba(75, 192, 192, 0.7)',
      'rgba(153, 102, 255, 0.7)',
      'rgba(255, 159, 64, 0.7)'
    ];

    this.vesselTypesChartData = {
      labels,
      datasets: [{
        data,
        backgroundColor: backgroundColors.slice(0, labels.length)
      }]
    };
  }

  /**
   * Prépare les données pour le graphique de temps d'attente
   */
  prepareWaitingTimesChart(): void {
    const labels = this.waitingTimeStats.map(stat => stat.port);
    const data = this.waitingTimeStats.map(stat => stat.moyenne);

    this.waitingTimesChartData = {
      labels,
      datasets: [{
        data,
        label: 'Temps moyen d\'attente (heures)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      }]
    };
  }

  /**
   * Formate le nom du mois pour l'affichage
   */
  formatMonth(month: string): string {
    const monthMap: { [key: string]: string } = {
      'JANUARY': 'Jan',
      'FEBRUARY': 'Fév',
      'MARCH': 'Mar',
      'APRIL': 'Avr',
      'MAY': 'Mai',
      'JUNE': 'Juin',
      'JULY': 'Juil',
      'AUGUST': 'Août',
      'SEPTEMBER': 'Sep',
      'OCTOBER': 'Oct',
      'NOVEMBER': 'Nov',
      'DECEMBER': 'Déc'
    };

    return monthMap[month] || month;
  }
}
