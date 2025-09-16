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
  private readonly emptyLineChartData: ChartData<'line'> = {
    labels: [],
    datasets: [],
  };

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

  public readonly viewModel$: Observable<CountryDetailsViewModel> = combineLatest([
    this.route.paramMap.pipe(
      map((params) => {
        const rawId = params.get('id');
        if (rawId === null) {
          return null;
        }

        const parsed = Number(rawId);
        return Number.isNaN(parsed) ? null : parsed;
      })
    ),
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

      const participations: Participation[] = [...country.participations].sort(
        (a, b) => a.year - b.year
      );

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
