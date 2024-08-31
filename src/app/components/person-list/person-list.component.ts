import { Component, OnInit } from '@angular/core';
import { PersonsService } from '../../services/persons.service';
import { Person } from '../../person.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-person-list',
  templateUrl: './person-list.component.html',
  styleUrls: ['./person-list.component.css']
})
export class PersonListComponent implements OnInit {
  persons: Person[] = [];
  displayedColumns: string[] = ['name', 'partner', 'actions'];

  constructor(private personsService: PersonsService, private router: Router) {}

  ngOnInit(): void {
    this.loadPersons();
    this.personsService.person$.subscribe(persons => {
      this.persons = persons;
    });
  }

  loadPersons(): void {
    this.personsService.getAllPersons().subscribe({
      next: (data) => {
        this.persons = data;
        console.log('Personas:', this.persons);
      },
      error: (error) => {
        console.error('Error al cargar las personas:', error);
      }
    });
  }

  editPerson(person: Person): void {
    console.log('Edit person:', person);
    this.personsService.setCurrentPerson(person);
    //guarda person en el local storage
    localStorage.setItem('person', JSON.stringify(person));
  }

  generateTree(person: Person): void {
    console.log('Generate tree for person:', person);
    this.router.navigate(['/TreeComponent', person]);

  }


  deletePerson(personId: number): void {
    console.log('Delete person:', personId);
    if (confirm('¿Estás seguro de que quieres eliminar esta persona?')) {
      this.personsService.deletePerson(personId).subscribe(() => {
        this.loadPersons();
      });
    }
  }
}
