import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, Observable, of } from 'rxjs';
import { Declaration } from '../models/declaration';
import { HistoriqueDeclarationUser } from '../models/HistoriqueDeclarationUser';
import { User } from '../models/User.model';
import { PredictionResult } from '../models/PredictionResult';

@Injectable({
  providedIn: 'root'
})
export class DeclarationService {

  private Url1 = 'http://localhost:8084/api'; 

  private apiUrl = 'http://localhost:8084/api/declarations'; 
  private apiUrl2 = 'http://localhost:8084/api/historique-declaration'; 
  private apiUrlpredFNB = 'http://localhost:8084/api/foncier-non-bati'; // Adaptez selon votre configuration
  private apiUrlpredFB = 'http://localhost:8084/api/foncier-bati'; // Adaptez selon votre configuration
  private apiUrlpredVH = 'http://localhost:8084/api/vehicules'; // Adaptez selon votre configuration




  constructor(private http: HttpClient) { }


  getPredictionsForDeclarationvh(declarationId: number): Observable<PredictionResult[]> {
  return this.http.get<PredictionResult[]>(`${this.apiUrlpredVH}/predictions-vehicule/${declarationId}`);
}
  
  getPredictionsForDeclarationfnb(declarationId: number): Observable<PredictionResult[]> {
  return this.http.get<PredictionResult[]>(`${this.apiUrlpredFNB}/predictions-foncier-non-bati/${declarationId}`);
}
  
getPredictionsForDeclaration(declarationId: number): Observable<PredictionResult[]> {
  return this.http.get<PredictionResult[]>(`${this.apiUrlpredFB}/predictions-foncier-bati/${declarationId}`);
}
  downloadVehiculeFile(vehiculeId: number): Observable<Blob> {
  const url = `${this.apiUrlpredVH}/download/${vehiculeId}`;
  
  return this.http.get(url, {
    responseType: 'blob' // Important pour les fichiers binaires
  });
}

downloadAnimauxFile(animauxId: number): Observable<Blob> {
  const url = `${this.Url1}/animaux/download/${animauxId}`; // Assurez-vous d'avoir apiUrlAnimaux défini
  return this.http.get(url, { responseType: 'blob' });
}

downloadAppareilFile(appareilId: number): Observable<Blob> {
  const url = `${this.Url1}/appareils-electromenagers/download/${appareilId}`;
  return this.http.get(url, { responseType: 'blob' });
}
downloadAutreBienFile(bienId: number): Observable<Blob> {
  const url = `${this.Url1}/autres-biens-de-valeur/download/${bienId}`;
  return this.http.get(url, { responseType: 'blob' });
}

downloadDetteFile(detteId: number): Observable<Blob> {
  const url = `${this.Url1}/autres-dettes/download/${detteId}`;
  return this.http.get(url, { responseType: 'blob' });
}

downloadDisponibiliteFile(disponibiliteId: number): Observable<Blob> {
  const url = `${this.Url1}/disponibilites-en-banque/download/${disponibiliteId}`;
  return this.http.get(url, { responseType: 'blob' });
}
downloadEmpruntFile(empruntId: number): Observable<Blob> {
  const url = `${this.Url1}/emprunts/download/${empruntId}`;
  return this.http.get(url, { responseType: 'blob' });
}
downloadEspeceFile(especeId: number): Observable<Blob> {
  const url = `${this.Url1}/especes/download/${especeId}`;
  return this.http.get(url, { responseType: 'blob' });
}
downloadFoncierBatiFile(foncierId: number): Observable<Blob> {
  const url = `${this.apiUrlpredFB}/download/${foncierId}`;
  return this.http.get(url, { responseType: 'blob' });
}
downloadFoncierNonBatiFile(foncierId: number): Observable<Blob> {
  const url = `${this.apiUrlpredFNB}/download/${foncierId}`;
  return this.http.get(url, { responseType: 'blob' });
}

downloadCreanceFile(creanceId: number): Observable<Blob> {
  const url = `${this.Url1}/les-creances/download/${creanceId}`;
  return this.http.get(url, { responseType: 'blob' });
}
// Pour les titres
downloadTitreFile(titreId: number): Observable<Blob> {
  const url = `${this.Url1}/titres/download/${titreId}`;
  return this.http.get(url, { responseType: 'blob' });
}

// Pour les revenus
downloadRevenuFile(revenuId: number): Observable<Blob> {
  const url = `${this.Url1}/revenus/download/${revenuId}`;
  return this.http.get(url, { responseType: 'blob' });
}

// Pour les meubles
downloadMeubleFile(meubleId: number): Observable<Blob> {
  const url = `${this.Url1}/meubles-meublants/download/${meubleId}`;
  return this.http.get(url, { responseType: 'blob' });
}
  
 getAllHistoriques(): Observable<HistoriqueDeclarationUser[]> {
    return this.http.get<HistoriqueDeclarationUser[]>(this.apiUrl2).pipe(
      catchError(error => {
        console.error('Erreur lors de la récupération de tous les historiques:', error);
        return of([]);
      })
    );
  }
  
  getHistoriqueByUtilisateur(utilisateurId: number): Observable<HistoriqueDeclarationUser[]> {
  const url = `${this.apiUrl2}/utilisateur/${utilisateurId}`;
  return this.http.get<HistoriqueDeclarationUser[]>(url).pipe(
    catchError(error => {
      console.error('Erreur lors de la récupération de l’historique utilisateur :', error);
      return of([]); // Retourne un tableau vide en cas d’erreur
    })
  );
}
getAllHistorique(): Observable<HistoriqueDeclarationUser[]> {
  return this.http.get<HistoriqueDeclarationUser[]>(`${this.apiUrl2}/historique-declaration/actives`);
}

 getFirstUtilisateurByRoleAndDeclaration(declarationId: number, role: string): Observable<User | null> {
  const url = `${this.apiUrl2}/declaration/${declarationId}/role/${role}/utilisateur`;
  console.log('Appel GET URL :', url);

  return this.http.get<User>(url).pipe(
    catchError((error) => {
      console.error('Erreur HTTP (PG):', error);
      return of(null);
    })
  );
}
getValidatedOrRefusedDeclarations(): Observable<Declaration[]> {
  const url = `${this.apiUrl}/validated-or-refused`;
  return this.http.get<Declaration[]>(url).pipe(
    catchError(error => {
      console.error('Erreur lors de la récupération des déclarations validées/refusées:', error);
      return of([]);
    })
  );
}

  getAllDeclarations(): Observable<Declaration[]> {
    return this.http.get<Declaration[]>(`${this.apiUrl}`);
  }

  getDeclarationsByUser(userId: number): Observable<Declaration[]> {
    console.log(userId);
    const url = `${this.apiUrl}/user/${userId}/declarations`;
    return this.http.get<Declaration[]>(url).pipe(
      catchError(error => {
        console.error('Erreur API:', error);
        return of([]); // Retourne un tableau vide en cas d'erreur
      }),
      map(response => response || []) // Convertit null en tableau vide
    );
  }


  // declaration.service.ts
  searchDeclarationsByUser(keyword: string, userId: number): Observable<Declaration[]> {
    const url = `${this.apiUrl}/search1?q=${keyword}&userId=${userId}`;
    return this.http.get<Declaration[]>(url);
  }
  
  
  getDeclarationDetails(id: number): Observable<Declaration> {
    return this.http.get<Declaration>(`${this.apiUrl}/${id}/details`);
  }
  

  generatePdf(id: number): Observable<Blob> {
    const url = `${this.apiUrl}/${id}/generate-pdf`;
    return this.http.get(url, { responseType: 'blob' }); // Important: 'blob' pour recevoir un fichier binaire
  }
  
  assignGerantToDeclaration(declarationId: number, gerantId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${declarationId}/assign-user/${gerantId}`, {});
  }


  searchDeclarations(keyword: string): Observable<Declaration[]> {
    return this.http.get<Declaration[]>(`${this.apiUrl}/search?keyword=${keyword}`);
  }


  generatePredictionReport(declarationId: number): Observable<Blob> {
    const url = `${this.apiUrlpredFNB}/rapport-prediction/${declarationId}`;
    
    // Configure les headers pour attendre un PDF
    const headers = new HttpHeaders({
      'Accept': 'application/pdf'
    });

    return this.http.get(url, {
      headers: headers,
      responseType: 'blob' // Important pour les fichiers binaires
    });
  }

  generatePredictionReportFB(declarationId: number): Observable<Blob> {
    const url = `${this.apiUrlpredFB}/rapport-prediction/${declarationId}`;
    
    const headers = new HttpHeaders({
      'Accept': 'application/pdf'
    });

    return this.http.get(url, {
      headers: headers,
      responseType: 'blob' // Important pour les fichiers binaires
    });
  }

  generatePredictionReportVH(declarationId: number): Observable<Blob> {
    const url = `${this.apiUrlpredVH}/rapport-prediction/${declarationId}`;
    
    const headers = new HttpHeaders({
      'Accept': 'application/pdf'
    });

    return this.http.get(url, {
      headers: headers,
      responseType: 'blob' // Important pour les fichiers binaires
    });
  }
  
transferDeclarations(
    sourceUserId: number, 
    targetUserId: number, 
    declarationIds?: number[]
  ): Observable<string> {
    const url = `${this.apiUrl}/transfer/${sourceUserId}/${targetUserId}`;
    
    // Envoie la liste des IDs ou un tableau vide si non fourni
    const body = declarationIds || [];
    
    return this.http.post<string>(url, body, {
      responseType: 'text' as 'json' // Correction du type pour éviter les warnings
    }).pipe(
      catchError(error => {
        console.error('Erreur lors du transfert:', error);
        if (error.status === 400) {
          return of(error.error); // Retourne le message d'erreur spécifique
        }
        return of('Une erreur technique est survenue lors du transfert');
      })
    );
  }

  
}
