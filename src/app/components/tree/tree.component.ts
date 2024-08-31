import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { TreeService } from '../../services/tree.service';
import * as d3 from 'd3';
import { HierarchyNode, hierarchy } from 'd3-hierarchy';
import dataJson from 'src/app/components/tree/data';


interface Relationship {
  id: number;
  fatherId: number | null;
  motherId: number | null;
  childId: number;
  father: any | null;
  mother: any | null;
  child: any;
}

interface FamilyTree {
  id: number;
  personName: string;
  partnerId: number | null;
  partner: any | null;
  fatherRelationships: Relationship[];
  motherRelationships: Relationship[];
  childRelationships: Relationship[];
}

@Component({
  selector: 'app-tree',
  templateUrl: './tree.component.html',
  styleUrls: ['./tree.component.css']
})
export class TreeComponent implements OnInit {

  @ViewChild('svgElement', { static: true }) svgElement: ElementRef | any;
  familyTree: FamilyTree | null = null;
  data: any;

  constructor(private treeService: TreeService) {

  }

  ngOnInit() {
    const personId = Number(window.location.href.split('/').pop());

    this.treeService.getFamilyTree(personId).subscribe((data: FamilyTree) => {
      this.familyTree = data;
      console.log('Family Tree Data:', this.familyTree);

      // Transformar la estructura del JSON
      const treeData = this.transformToTreeStructure(this.familyTree);

      console.log('Tree Data:', treeData);

      // Crear el árbol
      this.createTree(treeData);
    });
  }

  transformToTreeStructure(person: any): any {
    const transformedPerson = {
      name: person.personName,
      children: [] as any[] // Especifica que children es un array de tipo any
    };

    // Agregar la pareja si existe
    if (person.partner) {
      transformedPerson.children.push({
        name: person.partner.personName,
        isPartner: true, // Bandera para identificar a la pareja
        children: [] // La pareja puede tener sus propios hijos, si es necesario
      });
    }

    // Recorre las relaciones de padres para agregar a los hijos
    if (person.fatherRelationships && person.fatherRelationships.length > 0) {
      person.fatherRelationships.forEach((relationship: any) => {
        if (relationship.child) {
          transformedPerson.children.push(this.transformToTreeStructure(relationship.child)); // Usa this para llamar al método
        }
      });
    }

    return transformedPerson;
  }


  createTree(data: any) {
    const treeLayout = d3.tree().size([900,1300 ]);

    const svg = d3.select(this.svgElement.nativeElement)
    const g = svg.append("g").attr("transform", "translate(100,-20)");

    const root = d3.hierarchy(data);
    const tree = treeLayout(root);

    g.selectAll(".link")
        .data(tree.links())
        .enter().append("path")
        .attr("class", "link")
        .attr("d", (d3.linkHorizontal().x((d:any) => d.y ).y((d:any) => d.x)) as any)
        .style('fill', 'none')
        .style('stroke', '#ccc')
        .style('stroke-width', '1px'  );

    const node = g.selectAll(".node")
        .data(tree.descendants())
        .enter().append("g")
        .attr("class", "node")
        .attr("transform", d => `translate(${d.y},${d.x})`);

    node.append("circle")
        .attr("r", 10);

    node.append("text")
        .attr("dy", ".35em")
        .attr("x", d => d.children ? -13 : 13)
        .style('text-anchor', d => d.children ? 'end' : 'start')
        .style('fill', (d: any) => d.data.isPartner ? 'blue' : 'black')
        .text((d:any) => d.data.name);
  }

}
