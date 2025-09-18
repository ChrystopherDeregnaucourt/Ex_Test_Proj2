import { Component, OnInit } from '@angular/core';
import { filter, map, Observable, of } from 'rxjs';
import { OlympicService } from 'src/app/core/services/olympic.service';
import { Router } from '@angular/router';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import {
  ChartConfiguration,
  ChartData,
  ChartDataset,
  Chart,
  Plugin,
  ScriptableContext,
  TooltipItem,
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
    radius: '58%',
    layout: {
      padding: (context: ScriptableContext<'pie'>) => {
        const basePadding = context.chart.width * 0.28;
        const horizontalPadding = Math.max(96, Math.min(180, basePadding));

        return {
          top: 28,
          bottom: 28,
          left: horizontalPadding,
          right: horizontalPadding,
        };
      },
    },
    plugins: {
      legend: {
        display: false,
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
        display: false,
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

  private readonly calloutLabelsPlugin: Plugin<'pie'> = {
    id: 'pieCalloutLabels',
    afterDatasetsDraw: (chart) => {
      const { ctx, data, chartArea } = chart;
      const dataset = data.datasets[0];
      const meta = chart.getDatasetMeta(0);

      if (!dataset || !meta?.data.length || !chartArea) {
        return;
      }

      meta.data.forEach((element, index) => {
        const {
          x: centerX,
          y: centerY,
          startAngle,
          endAngle,
          outerRadius,
        } = element.getProps(['x', 'y', 'startAngle', 'endAngle', 'outerRadius'], true);

        const value = Number(dataset.data[index]);

        if (!value) {
          return;
        }

        const angle = (startAngle + endAngle) / 2;
        const radialGap = 18;
        const { left: chartLeft, right: chartRight } = chartArea;
        const canvasWidth = chart.width;
        const labelExtension = Math.min(canvasWidth * 0.35, 200);
        const textPadding = 12;
        const safetyPadding = 6;

        const startX = centerX + Math.cos(angle) * outerRadius;
        const startY = centerY + Math.sin(angle) * outerRadius;
        const middleX = centerX + Math.cos(angle) * (outerRadius + radialGap);
        const middleY = centerY + Math.sin(angle) * (outerRadius + radialGap);
        const isRightSide = Math.cos(angle) >= 0;
        const label = data.labels?.[index] ?? '';
        const text = `${label}: ${value}`;

        ctx.font = "600 12px 'Poppins', 'Segoe UI', Arial, sans-serif";
        const textWidth = ctx.measureText(text).width;

        const availableRight = Math.max(canvasWidth - chartRight - textPadding, 0);
        const availableLeft = Math.max(chartLeft - textPadding, 0);
        const desiredRightEnd = chartRight + Math.min(labelExtension, availableRight);
        const desiredLeftEnd = chartLeft - Math.min(labelExtension, availableLeft);

        const maxRightEnd = canvasWidth - textPadding - safetyPadding;
        const minLeftEnd = textWidth + textPadding + safetyPadding;

        let endX = isRightSide
          ? Math.min(desiredRightEnd, maxRightEnd)
          : Math.max(Math.min(desiredLeftEnd, chartLeft - safetyPadding), minLeftEnd);

        const endY = middleY;

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(middleX, middleY);
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = '#1f2937';
        ctx.textBaseline = 'middle';
        ctx.textAlign = isRightSide ? 'left' : 'right';

        const textX = isRightSide
          ? Math.min(endX + textPadding, canvasWidth - safetyPadding)
          : Math.max(
              Math.min(endX - textPadding, chartLeft - textPadding),
              textWidth + safetyPadding
            );

        endX = isRightSide
          ? Math.min(endX, textX - textPadding)
          : Math.max(endX, textX + textPadding);

        ctx.fillText(text, textX, endY);
        ctx.restore();
      });
    },
  };

  constructor(
    private readonly olympicService: OlympicService,
    private readonly router: Router
  ) {}

  ngOnInit(): void
  {
    Chart.register(ChartDataLabels, this.calloutLabelsPlugin);

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
        const pieDataset: ChartDataset<'pie', number[]> = {
          data: chartData,
          backgroundColor: chartLabels.map(() => this.getRandomColor()),
          borderColor: '#ffffff',
          borderWidth: 2,
          hoverOffset: 12,
        };

        return {
          countriesCount,
          olympicsCount,
          chartData: {
            labels: chartLabels,
            datasets: [pieDataset],
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
