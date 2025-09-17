import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  CategoryScale,
  Chart,
  ChartData,
  ChartOptions,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from 'chart.js';
import { combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Participation } from 'src/app/core/models/Participation';
import { OlympicService } from 'src/app/core/services/olympic.service';

// Enregistrement des composants nécessaires pour construire un graphique linéaire Chart.js.
Chart.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

interface CountryDetailsViewModel {
  status: 'loading' | 'error' | 'not-found' | 'ready';
  countryName: string;
  chartData: ChartData<'line'>;
  metrics: {
    entries: number;
    medals: number;
    athletes: number;
  };
}

@Component({
  selector: 'app-country-details',
  templateUrl: './country-details.component.html',
  styleUrls: ['./country-details.component.scss'],
})
export class CountryDetailsComponent {
  /**
   * Configuration de base renvoyée lorsque le graphique ne doit rien afficher
   * (pendant le chargement, une erreur ou l'absence de pays).
   */
  private readonly emptyLineChartData: ChartData<'line'> = {
    labels: [],
    datasets: [],
  };

  /**
   * Options Chart.js du graphique linéaire : titres d'axes, couleurs et
   * interactions sont alignés sur les spécifications design.
   */
  public readonly lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value =
              typeof context.parsed === 'number'
                ? context.parsed
                : context.parsed.y;

            return `${value} medals`;
          },
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Dates',
          color: '#475569',
        },
        ticks: {
          color: '#475569',
        },
        grid: {
          color: 'rgba(148, 163, 184, 0.2)',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Number of medals',
          color: '#475569',
        },
        ticks: {
          color: '#475569',
        },
        grid: {
          color: 'rgba(148, 163, 184, 0.2)',
        },
        beginAtZero: true,
      },
    },
    interaction: {
      mode: 'index',
      intersect: false,
    },
  };

  /**
   * Vue calculée en combinant l'identifiant fourni dans l'URL et les données du
   * service. Chaque cas fonctionnel (chargement, erreur, pays introuvable,
   * affichage) est matérialisé par un statut distinct pour simplifier le template.
   */
  public readonly viewModel$: Observable<CountryDetailsViewModel> = combineLatest([
    this.route.paramMap.pipe(
      // On extrait et on valide l'identifiant fourni dans l'URL.
      map((params) => {
        const rawId = params.get('id');
        if (rawId === null) {
          return null;
        }

        const parsed = Number(rawId);
        return Number.isNaN(parsed) ? null : parsed;
      })
    ),
    // Flux principal des données olympiques récupérées par le service.
    this.olympicService.getOlympics(),
  ]).pipe(
    map(([countryId, olympics]): CountryDetailsViewModel => {
      if (olympics === null) {
        return {
          status: 'error' as const,
          countryName: '',
          chartData: this.emptyLineChartData,
          metrics: { entries: 0, medals: 0, athletes: 0 },
        };
      }

      if (!olympics) {
        return {
          status: 'loading' as const,
          countryName: '',
          chartData: this.emptyLineChartData,
          metrics: { entries: 0, medals: 0, athletes: 0 },
        };
      }

      if (countryId === null) {
        return {
          status: 'not-found' as const,
          countryName: '',
          chartData: this.emptyLineChartData,
          metrics: { entries: 0, medals: 0, athletes: 0 },
        };
      }

      const country = olympics.find((olympic) => olympic.id === countryId);

      if (!country) {
        return {
          status: 'not-found' as const,
          countryName: '',
          chartData: this.emptyLineChartData,
          metrics: { entries: 0, medals: 0, athletes: 0 },
        };
      }

      // Copie triée chronologiquement des participations pour garantir l'ordre d'affichage.
      const participations: Participation[] = [...country.participations].sort(
        (a, b) => a.year - b.year
      );

      // Prépare les séries et labels du graphique linéaire en suivant l'ordre
      // chronologique des participations.
      const chartData: ChartData<'line'> = {
        labels: participations.map((participation) => participation.year.toString()),
        datasets: [
          {
            data: participations.map((participation) => participation.medalsCount),
            label: 'Total medals',
            borderColor: '#2563EB',
            backgroundColor: 'rgba(37, 99, 235, 0.15)',
            pointBackgroundColor: '#1D4ED8',
            pointHoverRadius: 6,
            pointRadius: 5,
            tension: 0.35,
            fill: true,
          },
        ],
      };

      // Agrégats utilisés pour alimenter les cartes de métriques dans la vue.
      const medals = participations.reduce(
        (total, participation) => total + participation.medalsCount,
        0
      );
      const athletes = participations.reduce(
        (total, participation) => total + participation.athleteCount,
        0
      );

      return {
        status: 'ready' as const,
        countryName: country.country,
        chartData,
        metrics: {
          entries: participations.length,
          medals,
          athletes,
        },
      };
    })
  );

  constructor(
    private readonly olympicService: OlympicService,
    private readonly route: ActivatedRoute
  ) {}
}
