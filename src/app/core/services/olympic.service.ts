import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

// Modèle représentant les données olympiques.
import { Olympic } from '../models/Olympic';

@Injectable({
  providedIn: 'root',
})
export class OlympicService {
  /**
   * URL du fichier JSON simulant l'API distante.
   */
  private olympicUrl = './assets/mock/olympic.json';
  /**
   * Flux d'état partagé entre tous les composants :
   *  - `undefined` tant que la requête est en cours (chargement)
   *  - `null` lorsqu'une erreur est survenue
   *  - `Olympic[]` lorsque les données ont été récupérées avec succès.
   */
  //On utilise BehaviorSubject au lieu de Subject pour stocker et émettre l'état des données olympiques.
  //BehaviorSubject permet de conserver la dernière valeur émise et de la fournir immédiatement aux nouveaux abonnés.
  //Ici, on initialise le BehaviorSubject avec undefined pour indiquer que les données sont en cours de chargement.
  private olympics$ = new BehaviorSubject<Olympic[] | null | undefined>(
    undefined
  );

  constructor(private http: HttpClient) {}

  /**
   * Déclenche une récupération des données olympiques et stocke le résultat
   * dans le BehaviourSubject, tout en exposant l'observable à l'appelant.
   */
  loadInitialData(): Observable<Olympic[] | null> {
    return this.http.get<Olympic[]>(this.olympicUrl).pipe
    (
      tap((value) => this.olympics$.next(value)),

      catchError((error) => 
      {
        // Journalisation simple pour diagnostiquer l'échec de la requête.
        console.error(error);

        // On publie `null` afin que les composants sortent de l'état de chargement.
        this.olympics$.next(null);
        return of(null);
      })
    );
  }

  /**
   * Expose l'état courant (chargement/erreur/données) aux composants consommateurs.
   */
  getOlympics(): Observable<Olympic[] | null | undefined> {
    return this.olympics$.asObservable();
  }

  /**
   * Retourne le détail d'un pays à partir de son identifiant sans rompre la
   * gestion des états :
   *  - `undefined` si la récupération est toujours en cours
   *  - `null` en cas d'erreur globale
   *  - `Olympic` lorsque le pays est trouvé.
   */
  getOlympicById(id: number): Observable<Olympic | undefined | null> {
    return this.olympics$.pipe(
      map((olympics) => {
        if (!olympics || olympics === null) {
          return olympics;
        }

        // Une fois les données disponibles, on recherche le pays correspondant.
        return olympics.find((olympic) => olympic.id === id);
      })
    );
  }
}
