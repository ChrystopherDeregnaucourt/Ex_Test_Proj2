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
export class HomeComponent {
  private readonly chartColors = [
    '#01B0B9',
    '#7DDDD3',
    '#F4C095',
    '#F4978E',
    '#8E64FF',
    '#60A5FA',
  ];

  private countrySegments: CountryMedal[] = [];

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

        const countries: CountryMedal[] = olympics.map((olympic) => ({
          id: olympic.id,
          name: olympic.country,
          totalMedals: olympic.participations.reduce(
            (total, participation) => total + participation.medalsCount,
            0
          ),
        }));

        const years = new Set<number>();
        olympics.forEach((olympic) =>
          olympic.participations.forEach((participation) =>
            years.add(participation.year)
          )
        );

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

  public onChartClick({
    active,
  }: {
    event?: ChartEvent;
    active?: Array<ActiveElement | object>;
  }): void {
    if (!this.isActiveElementArray(active) || active.length === 0) {
      return;
    }

    const index = active[0].index;
    const country = this.countrySegments[index];

    if (country) {
      this.goToCountry(country.id);
    }
  }

  private isActiveElementArray(
    elements?: Array<ActiveElement | object>
  ): elements is ActiveElement[] {
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

  public goToCountry(countryId: number): void {
    this.router.navigate(['/country', countryId]);
  }
}
