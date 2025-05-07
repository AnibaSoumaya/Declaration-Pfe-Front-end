import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Parametre } from '../models/Parametre.model';

@Injectable({
  providedIn: 'root'
})
export class ParametreGenerauxService {

  private apiUrl = 'http://localhost:8084/api/parametrages'; 

  constructor(private http: HttpClient) {}


  getParametrages(): Observable<Parametre[]> {
    return this.http.get<Parametre[]>(this.apiUrl);
  }


  updateValeur(id: number, valeur: string): Observable<Parametre> {
    return this.http.put<Parametre>(`${this.apiUrl}/${id}/valeur`, { valeur });
  }

  getParametrageByCode(code: string): Observable<Parametre> {
    return this.http.get<Parametre>(`${this.apiUrl}/search?code=${code}`);
  }

}
