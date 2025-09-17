import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NgChartsModule } from 'ng2-charts';
import { of } from 'rxjs';
import { OlympicService } from 'src/app/core/services/olympic.service';

import { HomeComponent } from './home.component';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(async () => {
    // Configuration du module de test avec le module de graphiques et le routeur simulé.
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, NgChartsModule],
      declarations: [HomeComponent],
      providers: [
        {
          provide: OlympicService,
          // On renvoie `undefined` pour simuler l'état de chargement exposé par le service.
          useValue: {
            getOlympics: () => of(undefined),
          },
        },
      ],
    }).compileComponents();

    // Création du composant et déclenchement du cycle de détection.
    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    // Vérifie que le composant s'instancie correctement avec les dépendances simulées.
    expect(component).toBeTruthy();
  });
});
