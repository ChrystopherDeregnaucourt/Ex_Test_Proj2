import { Component } from '@angular/core';
import { Router } from '@angular/router';
import {
  ActiveElement,
  ArcElement,
  Chart,
  ChartData,
  ChartEvent,
  ChartOptions,
  Legend,
  Tooltip,
} from 'chart.js';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { OlympicService } from 'src/app/core/services/olympic.service';

// On enregistre les éléments nécessaires à l'affichage d'un graphique circulaire.
Chart.register(ArcElement, Tooltip, Legend);

interface CountryMedal {
  id: number;
  name: string;
  totalMedals: number;
}

interface HomeViewModel {
  status: 'loading' | 'error' | 'ready';
  totalGames: number;
  totalCountries: number;
  chartData: ChartData<'pie', number[], string>;
  countries: CountryMedal[];
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent 
{
  /**
   * Palette de couleurs utilisée pour différencier les pays dans le graphique.
   */
  private readonly chartColors = [
    '#01B0B9',
    '#7DDDD3',
    '#F4C095',
    '#F4978E',
    '#8E64FF',
    '#60A5FA',
  ];

  /**
   * Copie locale des segments du camembert pour retrouver rapidement le pays
   * correspondant lors d'un clic sur une portion du graphique.
   */
  private countrySegments: CountryMedal[] = [];

  /**
   * Jeu de données vide utilisé pendant le chargement ou en cas d'erreur pour
   * conserver la configuration attendue par `baseChart`.
   */
  private readonly emptyPieChartData: ChartData<'pie', number[], string> = {
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: [],
        borderColor: '#FFFFFF',
        borderWidth: 2,
      },
    ],
  };

  /**
   * Options Chart.js appliquées au graphique circulaire pour respecter la
   * maquette (légende à droite, couleurs d'accessibilité, etc.).
   */
  public readonly pieChartOptions: ChartOptions<'pie'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          boxWidth: 16,
          boxHeight: 16,
          color: '#0F172A',
          usePointStyle: true,
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => `${context.label}: ${context.parsed} medals`,
        },
      },
    },
  };

  /**
   * Vue dérivée des données exposées par le service : selon l'état reçu, on
   * renvoie un modèle adapté au template (chargement, erreur ou données prêtes).
   */
  public readonly homeView$: Observable<HomeViewModel> = this.olympicService
    .getOlympics()
    .pipe(
      map((olympics): HomeViewModel => {
        if (olympics === null) {
          return {
            status: 'error' as const,
            totalGames: 0,
            totalCountries: 0,
            chartData: this.emptyPieChartData,
            countries: [],
          };
        }

        if (!olympics) {
          return {
            status: 'loading' as const,
            totalGames: 0,
            totalCountries: 0,
            chartData: this.emptyPieChartData,
            countries: [],
          };
        }

        // Transformation des données brutes en une liste simplifiée pour la vue.
        const countries: CountryMedal[] = olympics.map((olympic) => ({
          id: olympic.id,
          name: olympic.country,
          totalMedals: olympic.participations.reduce(
            (total, participation) => total + participation.medalsCount,
            0
          ),
        }));

        // On collecte l'ensemble des années représentées pour calculer le nombre total de Jeux.
        const years = new Set<number>();
        olympics.forEach((olympic) =>
          olympic.participations.forEach((participation) =>
            years.add(participation.year)
          )
        );

        // Construction du jeu de données attendu par Chart.js pour le camembert.
        const chartData: ChartData<'pie', number[], string> = {
          labels: countries.map((country) => country.name),
          datasets: [
            {
              data: countries.map((country) => country.totalMedals),
              backgroundColor: countries.map(
                (_, index) => this.chartColors[index % this.chartColors.length]
              ),
              borderColor: '#FFFFFF',
              borderWidth: 2,
              hoverOffset: 8,
            },
          ],
        };

        return {
          status: 'ready' as const,
          totalGames: years.size,
          totalCountries: olympics.length,
          chartData,
          countries,
        };
      }),
      // On met à jour la correspondance index -> pays lorsque les données sont prêtes.
      tap((view) => {
        if (view.status === 'ready') {
          this.countrySegments = view.countries;
        } else {
          this.countrySegments = [];
        }
      })
    );

  constructor(
    private readonly olympicService: OlympicService,
    private readonly router: Router
  ) {}

  /**
   * Gestionnaire déclenché par `baseChart` lorsque l'utilisateur clique sur
   * une portion du camembert.
   */
  public onChartClick({active,}: {event?: ChartEvent; active?: Array<ActiveElement | object>;}): void {
    if (!this.isActiveElementArray(active) || active.length === 0) {
      return;
    }

    const index = active[0].index;
    const country = this.countrySegments[index];

    if (country) {
      this.goToCountry(country.id);
    }
  }

  /**
   * Garde de type permettant de s'assurer que le tableau d'éléments actifs
   * expose bien les propriétés `index` attendues par Chart.js.
   */
  private isActiveElementArray(
    elements?: Array<ActiveElement | object>): 
    elements is ActiveElement[] 
  {
    return (
      Array.isArray(elements) &&
      elements.every(
        (element) =>
          'index' in element &&
          'datasetIndex' in element &&
          typeof element.index === 'number'
      )
    );
  }

  /**
   * Redirige l'utilisateur vers la page de détails du pays sélectionné.
   */
  public goToCountry(countryId: number): void {
    this.router.navigate(['/country', countryId]);
  }
}
