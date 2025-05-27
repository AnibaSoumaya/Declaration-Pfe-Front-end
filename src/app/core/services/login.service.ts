import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, Observable, of } from 'rxjs';
import { Router } from '@angular/router';
import { User } from '../models/User.model';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private apiURL: string = 'http://localhost:8084/api/auth'; 
    private apiUrl1 = 'http://localhost:8084/api/utilisateurs';
 


  constructor(
    private http: HttpClient,
    private router: Router,
    private userService: UserService

  ) { }

  // Dans login.service.ts

resetPassword(email: string): Observable<any> {
  return this.http.post(`${this.apiUrl1}/reset-password`, null, {
    params: { email }
  });
}

checkEmailExists(email: string): Observable<boolean> {
  return this.http.get<User>(`${this.apiUrl1}/by-email`, {
    params: { email }
  }).pipe(
    map(user => !!user),
    catchError(() => of(false))
)}

  login(email: string, password: string): Observable<User> {
    const body = { email, password };  
    return this.http.post<User>(`${this.apiURL}/authenticate`, body); 
  }

  setAuthData(token: string, userId: string, firstname: string, lastname: string): void {
    localStorage.setItem('authToken', token);
    localStorage.setItem('userId', userId); 
    localStorage.setItem('firstname', firstname);
    localStorage.setItem('lastname', lastname);
  }

  private role: string | null = null;

  getRole(): string | null {
    return this.role;
  }
  
  fetchAndStoreRole(): void {
    this.userService.getCurrentUser().subscribe({
      next: user => {
        this.role = user.role;
      },
      error: err => {
        console.error('Erreur lors de la récupération du rôle:', err);
        this.role = null;
      }
    });
  }
  

  
  getToken(): string | null {
    return localStorage.getItem('authToken');
  }
  
  getUserNom(): string | null {
    return localStorage.getItem('lastname');
  }
  
  getUserPrenom(): string | null {
    return localStorage.getItem('firstname');
  }
  
  
  getUserId(): string | null {
    return localStorage.getItem('userId');
  }

  logout(): void {
    // Supprimer toutes les données d'authentification du localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('firstname');
    localStorage.removeItem('lastname');
    
    // Rediriger vers la page de login
    this.router.navigate(['/securite']);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
/*
  getRole(): string {
    const token = localStorage.getItem('authToken');
    if (!token) return '';
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.authorities ? payload.authorities[0] : ''; 
    } catch (e) {
      console.error('Erreur lors du décodage du token:', e);
      return '';
    }
  }
*/
  
  decodeToken(token: string): any {
    try {
      const payload = token.split('.')[1];
      return JSON.parse(atob(payload));
    } catch (e) {
      console.error('Erreur lors du décodage du token:', e);
      return null;
    }  
  }

  logoutFromServer(): Observable<any> {
    const token = this.getToken();
    if (!token) {
      return new Observable(observer => {
        observer.error('Token not found');
      });
    }
  
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  
    return this.http.post(`${this.apiURL}/logout`, {}, { headers });
  }
}