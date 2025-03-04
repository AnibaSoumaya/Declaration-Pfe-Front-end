import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/User.model';


@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private apiURL: string = 'http://localhost:8084/api/auth';  // L'URL de l'API backend

  constructor(private http: HttpClient) { }

  // Fonction de connexion
  login(email: string, password: string): Observable<User> {
    const body = { email, password };  // On envoie email et password au backend
    return this.http.post<User>(`${this.apiURL}/authenticate`, body); // POST request pour l'authentification
  }

  // Fonction pour stocker le token dans le localStorage
  setToken(token: string): void {
    localStorage.setItem('authToken', token);
  }

  // src/app/core/services/login.service.ts
  decodeToken(token: string): any {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));  // Décodage du payload du token JWT
  }


  // Fonction pour récupérer le token depuis le localStorage
  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  // Fonction pour supprimer le token lors de la déconnexion
  logout(): void {
    localStorage.removeItem('authToken');
  }

  // Fonction pour vérifier si l'utilisateur est authentifié (s'il a un token)
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getRole(): string {
    const token = localStorage.getItem('authToken');
    if (!token) return '';
    
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.authorities ? payload.authorities[0] : ''; // Assuming you have a single role
  }

  isAdmin(): boolean {
    return this.getRole() === 'administrateur';
  }
}
