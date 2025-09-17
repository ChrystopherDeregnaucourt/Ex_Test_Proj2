import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { OlympicService } from './core/services/olympic.service';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  // Simulation de la méthode loadInitialData pour vérifier son appel automatique.
  const loadInitialDataSpy = jasmine
    .createSpy('loadInitialData')
    .and.returnValue(of(null));

  beforeEach(async () => {
    loadInitialDataSpy.calls.reset();

    await TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [AppComponent],
      providers: [
        {
          provide: OlympicService,
          useValue: {
            loadInitialData: loadInitialDataSpy,
          },
        },
      ],
    }).compileComponents();
  });

  it('should create the app and trigger data loading', () => {
    // On crée le composant racine.
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    fixture.detectChanges();

    // Vérification : le composant existe et la récupération des données est lancée.
    expect(app).toBeTruthy();
    expect(loadInitialDataSpy).toHaveBeenCalled();
  });
});
