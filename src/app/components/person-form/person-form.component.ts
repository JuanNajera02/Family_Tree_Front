import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { PersonsService } from 'src/app/services/persons.service';
import { Person } from '../../person.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-person-form',
  templateUrl: './person-form.component.html',
  styleUrls: ['./person-form.component.css']
})
export class PersonFormComponent implements OnInit {
  personForm: FormGroup;
  persons: Person[] = [];
  personsWithoutPartner: Person[] = [];
  currentPersonId: number | null = null;

  constructor(private fb: FormBuilder, private personsService: PersonsService, private router: Router) {
    this.personForm = this.fb.group({
      personId: [null],
      personName: ['', Validators.required],
      partnerId: [null],
      childrenIds: this.fb.array([]) // Array para los hijos
    });
  }
  ngOnInit(): void {
    // Obtener todas las personas sin pareja
    this.personsService.getPersonsWNotPartner().subscribe(persons => {
      this.personsWithoutPartner = persons;
    });

    this.personsService.currentPerson$.subscribe(person => {
      if (person) {
        this.currentPersonId = person.id;
        this.personForm.patchValue({
          personId: person.id,
          personName: person.personName,
          partnerId: person.partnerId
        });
        this.loadChildrenAndMarkSelected(person.id);

        // Forzar la actualización del mat-select
        this.personForm.get('partnerId')?.markAsTouched();
      } else {
        this.loadAllWithoutChildren();
      }
    });

    // Suscribirse a los cambios en partnerId
    this.personForm.get('partnerId')?.valueChanges.subscribe(value => {
      this.handlePartnerChange(value);
    });
  }






  loadAllWithoutChildren(): void {
    this.personsService.getAllWNotChildren().subscribe(persons => {
      this.persons = persons;
      this.populateChildrenFormArray();
    });
  }

  loadChildrenAndMarkSelected(id: number): void {
    this.personsService.getAllWNotChildrenAndChildren(id).subscribe(persons => {
      this.persons = persons;
      this.populateChildrenFormArray();
    });
  }

// Agrega este array a tu clase
deletedChildId: number | null = null;

handlePartnerChange(selectedPartnerId: number | null): void {
  const childrenFormArray = this.personForm.get('childrenIds') as FormArray;

  //borra todo el valor del formulario



  // Si hay un elemento eliminado previamente, vuelve a agregarlo al FormArray
  if (this.deletedChildId !== null) {
    // Verifica si el ID del elemento eliminado previamente ya está en el FormArray
    const existingControl = childrenFormArray.controls.find(control => control.get('id')?.value === this.deletedChildId);
    if (!existingControl) {
      // Solo vuelve a agregar el elemento eliminado previamente si no está en el FormArray
      childrenFormArray.push(this.fb.group({
        id: [this.deletedChildId],
        selected: [false]
      }));
    }
    // Resetea el ID del elemento eliminado anteriormente
    this.deletedChildId = null;
  }

  // Verifica si se ha seleccionado un socio válido
  if (selectedPartnerId !== null) {
    // Encuentra el control en el FormArray que corresponde al ID del socio seleccionado
    const controlToRemove = childrenFormArray.controls.find(control => control.get('id')?.value === selectedPartnerId);

    if (controlToRemove) {
      // Marca el checkbox como deseleccionado
      controlToRemove.get('selected')?.setValue(false);

      // Elimina el control del FormArray
      const index = childrenFormArray.controls.indexOf(controlToRemove);
      if (index > -1) {
        childrenFormArray.removeAt(index);
      }

      // Guarda el ID del elemento eliminado actual
      this.deletedChildId = selectedPartnerId;

      // Actualiza el local storage
      const currentPersonLS = JSON.parse(localStorage.getItem('person') || '{}');
      currentPersonLS.partnerId = selectedPartnerId;
      localStorage.setItem('person', JSON.stringify(currentPersonLS));

      // Actualiza la lista de posibles hijos para reflejar los cambios
      this.populateChildrenFormArray();
    }
  }
}





  populateChildrenFormArray(): void {
    const childrenFormArray = this.personForm.get('childrenIds') as FormArray;

    // Limpiar el array antes de agregar elementos nuevos
    while (childrenFormArray.length) {
      childrenFormArray.removeAt(0);
    }

    // Verifica si persons está vacío
    if (!this.persons || this.persons.length === 0) {
      console.error('La lista de personas está vacía o no se ha inicializado.');
      return;
    }

    // Obtener la persona actual
    const currentPersonLS = JSON.parse(localStorage.getItem('person') || '{}');
    const currentPerson: Person = {
      id: currentPersonLS.id,
      personName: currentPersonLS.personName,
      partnerId: currentPersonLS.partnerId,
      fatherRelationships: currentPersonLS.fatherRelationships,
      motherRelationships: currentPersonLS.motherRelationships,
      partner: currentPersonLS.partner,
      childrenIds: currentPersonLS.childrenIds,
      childRelationships: currentPersonLS.childRelationship
    };

    if (!currentPerson) {
      console.error(`No se encontró la persona con ID ${this.currentPersonId}`);
      return;
    }

        //busca la pareja de la persona actual en la lista de personas y si esta quitala de la lista
        const partnerIndex = this.persons.findIndex(person => person.id === currentPerson.partnerId);
        if (partnerIndex !== -1) {
          this.persons.splice(partnerIndex, 1);
        }

    // Obtener los IDs de los hijos de la persona actual y su pareja
    const currentPersonChildIds = [
      ...(currentPerson.fatherRelationships || []).map(rel => rel.childId),
      ...(currentPerson.motherRelationships || []).map(rel => rel.childId)
    ];

    const partnerChildIds = currentPerson.partner ? [
      ...(currentPerson.partner.fatherRelationships || []).map(rel => rel.childId),
      ...(currentPerson.partner.motherRelationships || []).map(rel => rel.childId)
    ] : [];

    const childIds = [...currentPersonChildIds, ...partnerChildIds];

    // Llenar el FormArray con los hijos correspondientes
    this.persons.forEach(person => {
      // Verifica si la persona ya está en el FormArray
      const existingControl = childrenFormArray.controls.find(control => control.get('id')?.value === person.id);

      // Si no está, agrégala
      if (!existingControl) {
        childrenFormArray.push(this.fb.group({
          id: [person.id],
          selected: [childIds.includes(person.id)] // Marca el checkbox si la persona es un hijo
        }));
      }
    });

    console.log(this.personForm);
  }



  toggleChild(personId: number): void {
    const childrenArray = this.personForm.get('childrenIds') as FormArray;
    const childGroup = childrenArray.controls.find(control => control.get('id')?.value === personId);

    if (childGroup) {
      const selectedControl = childGroup.get('selected');
      selectedControl?.setValue(!selectedControl?.value);
    }
  }

  onSubmit(): void {
    if (this.personForm.valid) {
      const personData = this.personForm.value;
      const selectedChildren = this.personForm.value.childrenIds
        .filter((child: { selected: boolean }) => child.selected)
        .map((child: { id: number }) => child.id);

      personData.childrenIds = selectedChildren;

      if (this.currentPersonId == null || personData.personId == null) {
        console.log(personData);
        this.personsService.addPerson(personData).subscribe({
          next: () => {
            alert('Persona creada correctamente');
            this.loadAllWithoutChildren();
            this.personsService.getPersonsWNotPartner().subscribe(persons => {
              this.personsWithoutPartner = persons;
            });

            this.personsService.loadPersons();
            this.onCancel(); // Resetear formulario después de la creación
          },
          error: () => {
            alert('Error al crear la persona');
          }
        });
      } else {
        //valida que el id de la persona no sea igual al id de la pareja
        if (personData.id === personData.partnerId) {
          alert('No puedes seleccionar a la misma persona como pareja');
          return;
        }
        console.log(personData);
        this.personsService.updatePerson(personData).subscribe({
          next: () => {
            alert('Persona actualizada correctamente');
            this.personsService.loadPersons();
            this.personsService.getPersonsWNotPartner().subscribe(persons => {
              this.personsWithoutPartner = persons;
            });
            this.onCancel(); // Resetear formulario después de la actualización
          },
          error: () => {
            alert('Error al actualizar la persona');
          }
        });
      }
    } else {
      alert('Por favor, rellena todos los campos');
    }
    this.personsService.getPersonsWNotPartner().subscribe(persons => {
      this.personsWithoutPartner = persons;
    });
  }

  onCancel(): void {
    //borra el local storage
    localStorage.removeItem('person');
    this.personForm.value.personId = null;
    this.personForm.reset();
    this.loadAllWithoutChildren();
    this.populateChildrenFormArray();
  }





}
