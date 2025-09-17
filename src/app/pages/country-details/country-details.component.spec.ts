import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { NgChartsModule } from 'ng2-charts';
import { of } from 'rxjs';
import { OlympicService } from 'src/app/core/services/olympic.service';

import { CountryDetailsComponent } from './country-details.component';

describe('CountryDetailsComponent', () => {
  let component: CountryDetailsComponent;
  let fixture: ComponentFixture<CountryDetailsComponent>;

  beforeEach(async () => {
    // Initialisation du module de test avec le routeur simulé et le module de graphiques.
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, NgChartsModule],
      declarations: [CountryDetailsComponent],
      providers: [
        {
          provide: OlympicService,
          // Observable `undefined` : le composant doit gérer l'état de chargement.
          useValue: {
            getOlympics: () => of(undefined),
          },
        },
        {
          provide: ActivatedRoute,
          // Fournit un paramètre de route fictif pour alimenter le ViewModel.
          useValue: {
            paramMap: of(convertToParamMap({ id: '1' })),
          },
        },
      ],
    }).compileComponents();

    // Création du composant et lancement de la détection de changements.
    fixture = TestBed.createComponent(CountryDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    // S'assure que la configuration minimale permet d'instancier le composant.
    expect(component).toBeTruthy();
  });
});
