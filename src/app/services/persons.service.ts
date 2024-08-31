import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Person } from '../person.model'
import { addPerson } from '../addPerson.model'
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PersonsService {

  private baseUrl: string = 'https://localhost:7190/api/Persons'; // Asegúrate de que la URL base sea correcta

  private personSubject = new BehaviorSubject<Person[]>([]);
  person$ = this.personSubject.asObservable();


  constructor(private http: HttpClient) {
    this.loadPersons();
  }

  loadPersons(): void {
    this.getAllPersons().subscribe(persons => {
      this.personSubject.next(persons);
    });
  }

  getAllPersons(): Observable<Person[]> {
    return this.http.get<Person[]>(`${this.baseUrl}/GetAllPersons`);
  }

  updatePersonsList(persons: Person[]): void {
    this.personSubject.next(persons);
  }

  ///api/Persons/AddPersons
  addPerson(person: addPerson): Observable<any> {
    return this.http.post(`${this.baseUrl}/AddPersons`, person);
  }

  // /api/Persons/GetPersonsWNotPartner
  getPersonsWNotPartner(): Observable<Person[]> {
    return this.http.get<Person[]>(`${this.baseUrl}/GetPersonsWNotPartner`);
  }

  ///api/Persons/GetAllWNotChildren
  getAllWNotChildren(): Observable<Person[]> {
    return this.http.get<Person[]>(`${this.baseUrl}/GetAllWNotChildren`);
  }

  ///api/Persons/DeletePersons/{id}
  deletePerson(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/DeletePersons/${id}`);
  }

  ///api/Persons/UpdatePersons
  updatePerson(person: Person): Observable<Person> {
    return this.http.put<Person>(`${this.baseUrl}/UpdatePersons`, person);
  }
  ///api/Persons/GetAllWNotChildrenAndChildren/{id}
  getAllWNotChildrenAndChildren(id: number): Observable<Person[]> {
    return this.http.get<Person[]>(`${this.baseUrl}/GetAllWNotChildrenAndChildren/${id}`);
  }




  private currentPersonSubject = new BehaviorSubject<Person | null>(null);
  currentPerson$ = this.currentPersonSubject.asObservable();

  setCurrentPerson(person: Person): void {
    this.currentPersonSubject.next(person);
  }

  clearCurrentPerson(): void {
    this.currentPersonSubject.next(null);
  }



}

