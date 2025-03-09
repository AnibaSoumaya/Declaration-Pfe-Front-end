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

  // Fonction pour stocker le token et l'ID utilisateur dans le localStorage
  setAuthData(token: string, userId: string): void {
    localStorage.setItem('authToken', token);
    localStorage.setItem('userId', userId);  // Stocke également l'ID de l'utilisateur
  }

  // Fonction pour récupérer le token depuis le localStorage
  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  // Fonction pour récupérer l'ID utilisateur depuis le localStorage
  getUserId(): string | null {
    return localStorage.getItem('userId');
  }

  // Fonction pour supprimer le token et l'ID utilisateur lors de la déconnexion
  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
  }

  // Fonction pour vérifier si l'utilisateur est authentifié (s'il a un token)
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // Fonction pour obtenir le rôle de l'utilisateur à partir du token
  getRole(): string {
    const token = localStorage.getItem('authToken');
    if (!token) return '';
    
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.authorities ? payload.authorities[0] : ''; // Assuming you have a single role
  }

  // Fonction pour vérifier si l'utilisateur est un administrateur
  isAdmin(): boolean {
    return this.getRole() === 'administrateur';
  }

  // Fonction pour décoder le token JWT
  decodeToken(token: string): any {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));  // Décodage du payload du token JWT
  }
}
