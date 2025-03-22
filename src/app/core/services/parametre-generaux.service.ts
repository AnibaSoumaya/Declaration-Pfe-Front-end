import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Parametrage } from '../models/parametre.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ParametreGenerauxService {

  private apiUrl = 'http://localhost:8084/api/parametrages'; // Remplace par l'URL de ton backend si différent

  constructor(private http: HttpClient) {}

  // Récupérer tous les paramètres
  getParametrages(): Observable<Parametrage[]> {
    return this.http.get<Parametrage[]>(this.apiUrl);
  }

  // Mettre à jour la valeur d'un paramètre
  updateValeur(id: number, valeur: string): Observable<Parametrage> {
    return this.http.put<Parametrage>(`${this.apiUrl}/${id}/valeur`, { valeur });
  }
}
