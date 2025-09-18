import { Component, OnInit } from '@angular/core';
import { filter, map, Observable, of } from 'rxjs';
import { OlympicService } from 'src/app/core/services/olympic.service';
import { Router } from '@angular/router';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import {
  ChartConfiguration,
  ChartData,
  ChartType,
  TooltipItem,
  Chart,
} from 'chart.js';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
    standalone: false
})
export class HomeComponent implements OnInit {
  public olympics$: Observable<any> = of(null);

  public viewModel$: Observable<HomeViewModel> = of({
    countriesCount: 0,
    olympicsCount: 0,
    chartData: { labels: [], datasets: [] },
  });

  public pieChartOptions: ChartConfiguration<'pie'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
    legend: {
      display: false, // Cache la légende classique
      labels: {
        usePointStyle: true,
        color: '#1f2937',
        padding: 20,
        font: {
          family: '"Poppins", "Segoe UI", Arial, sans-serif',
          size: 13,
          weight: 500,
        },
      },
    },
    datalabels: {
      color: '#333',
      font: {
        weight: 'bold',
        size: 12,
      },
      formatter: (value: number, context: { chart: Chart; dataIndex: number }) => {
        const label = context.chart.data.labels?.[context.dataIndex] ?? '';
        return `${label}: ${value}`; // Affiche le label et la valeur
      },
      anchor: 'end',
      align: 'end',
      offset: 10,
      backgroundColor: 'rgba(255,255,255,0.8)',
      borderRadius: 6,
      padding: 4,
    },
      tooltip: {
        callbacks: {
          label: (context: TooltipItem<'pie'>) => {
            const label = context.label ?? '';
            return `${label}: ${context.raw} medals`;
          },
        },
      },
    },
  };

  constructor(
    private readonly olympicService: OlympicService,
    private readonly router: Router
  ) {}

  ngOnInit(): void 
  {
    Chart.register(ChartDataLabels);

    this.olympics$ = this.olympicService.getOlympics();
    this.viewModel$ = this.olympics$.pipe(
      filter((olympics): olympics is OlympicCountry[] => Array.isArray(olympics)),
      map((olympics) => {
        const countriesCount = olympics.length;
        const olympicsCount = olympics.reduce(
          (total, country) => total + country.participations.length,
          0
        );
        const chartLabels = olympics.map((country) => country.country);
        const chartData = olympics.map((country) =>
          country.participations.reduce(
            (medalSum, participation) => medalSum + participation.medalsCount,
            0
          )
        );
        return {
          countriesCount,
          olympicsCount,
          chartData: {
            labels: chartLabels,
            datasets: [
              {
                data: chartData,
                backgroundColor: chartLabels.map(() => this.getRandomColor()),
                borderColor: '#ffffff',
                borderWidth: 2,
                hoverOffset: 12,
              },
            ],
          } as ChartData<'pie', number[], string | string[]>,
        };
      })
    );
  }

  public goToCountry(countryId: number): void 
  {
    this.router.navigate(['/country', countryId]);
  }
  
  public getRandomColor() 
  {
    // Génère une couleur hexadécimale aléatoire
    return '#' + Math.floor(Math.random()*16777215).toString(16);
  }
}

interface OlympicParticipation {
  id: number;
  year: number;
  city: string;
  medalsCount: number;
  athleteCount: number;
}

interface OlympicCountry {
  id: number;
  country: string;
  participations: OlympicParticipation[];
}

interface HomeViewModel {
  countriesCount: number;
  olympicsCount: number;
  chartData: ChartData<'pie', number[], string | string[]>;
}
