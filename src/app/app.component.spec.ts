import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { OlympicService } from './core/services/olympic.service';
import { AppComponent } from './app.component';

// Tests unitaires pour le composant racine de l'application AppComponent.

describe('AppComponent', () => {
  // Simulation de la méthode loadInitialData pour vérifier son appel automatique.

  //ici on utilise jasmine pour créer un espion (spy) sur la méthode loadInitialData
  //de OlympicService. Cet espion permet de vérifier si la méthode est appelée
  //lorsque le composant est initialisé.
  const loadInitialDataSpy = jasmine
    .createSpy('loadInitialData')
    .and.returnValue(of(null));

  // Configuration du module de test avant chaque test.
  beforeEach(async () => {
    loadInitialDataSpy.calls.reset();

    // Configuration du module de test avec les dépendances nécessaires.
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [AppComponent],
      providers: [
        {
          provide: OlympicService,
          // On remplace OlympicService par une version factice (mock) qui utilise l'espion.
          useValue: {
            loadInitialData: loadInitialDataSpy,
          },
        },
      ],
    }).compileComponents();
  });

  // Test : vérifie que le composant est créé et que la méthode de chargement des données est appelée.

  it('should create the app and trigger data loading', () => {
    // On crée le composant racine.
    const fixture = TestBed.createComponent(AppComponent);

    // Récupération de l'instance du composant.
    const app = fixture.componentInstance;

    // Déclenche la détection des changements pour initialiser le composant.
    fixture.detectChanges();

    // Vérification : le composant existe et la récupération des données est lancée.
    expect(app).toBeTruthy();
    
    // Vérification : la méthode de chargement des données a été appelée.
    expect(loadInitialDataSpy).toHaveBeenCalled();
  });
});
