// person.model.ts
export interface Person {
  id: number;
  personName: string;
  partnerId?: number | null;
  partner?: Person | null;
  childrenIds: number[]; 
  fatherRelationships: Relationship[];
  motherRelationships: Relationship[];
  childRelationships: Relationship[];
}

export interface Relationship {
  id: number;
  fatherId?: number | null;
  motherId?: number | null;
  childId: number;
  father?: Person | null;
  mother?: Person | null;
  child?: Person | null;
}
