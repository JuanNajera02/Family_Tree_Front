import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface Relationship {
  id: number;
  fatherId: number;
  motherId: number;
  childId: number;
  father: string;
  mother: string;
  child: string;
}

interface FamilyTree {
  id: number;
  personName: string;
  partnerId: number;
  partner: string;
  fatherRelationships: Relationship[];
  motherRelationships: Relationship[];
  childRelationships: Relationship[];
}

@Injectable({
  providedIn: 'root'
})
export class TreeService {

  private baseUrl: string = 'https://localhost:7190/api/';

  constructor(private http: HttpClient) { }

  getFamilyTree(personId: number): Observable<FamilyTree> {
    return this.http.get<FamilyTree>(`${this.baseUrl}Persons/GetFamilyTree/${personId}`);
  }
}


