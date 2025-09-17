# Olympic Games Dashboard

An interactive Angular dashboard that showcases the medal history of countries from previous Olympic Games. The application was designed to match the provided wireframes and to work seamlessly on desktop and mobile screens.

## Features

- **Dashboard overview** with the total number of Olympic editions and participating countries.
- **Interactive pie chart** displaying the number of medals per country (click a country to open its detailed view).
- **Country detail page** with key metrics and a line chart showing the evolution of medals through the years.
- Responsive layout with accessible UI states for loading and error handling.

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org/) version 18 or higher (LTS recommended)
- [npm](https://www.npmjs.com/) version 9 or higher

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```
2. Launch the development server:
   ```bash
   npm start
   ```
3. Open your browser at [http://localhost:4200](http://localhost:4200).

The application automatically reloads when a source file is updated.

### Available scripts

- `npm start` – Start the local development server.
- `npm run build` – Build the project for production in the `dist/` directory.
- `npm test` – Run the unit tests with Karma.

## Project structure

```
src/
├── app/
│   ├── core/            # Models and services
│   ├── pages/
│   │   ├── home/        # Dashboard (pie chart) page
│   │   ├── country-details/ # Detail (line chart) page
│   │   └── not-found/
│   ├── app-routing.module.ts
│   └── app.module.ts
└── assets/mock/         # Olympic data source
```

The Olympic dataset is stored under `src/assets/mock/olympic.json`. The `OlympicService` handles data retrieval and exposes typed observables to the application.

## Tech stack

- [Angular 18](https://angular.io/)
- [ng2-charts](https://valor-software.com/ng2-charts/) & [Chart.js](https://www.chartjs.org/) for data visualisation
- [RxJS](https://rxjs.dev/) for reactive data flows

## Notes

- All HTTP calls are encapsulated in Angular services following best practices.
- Observables are consumed via the `async` pipe to avoid manual subscriptions.
- The codebase is fully typed with dedicated interfaces for Olympic countries and participations.
