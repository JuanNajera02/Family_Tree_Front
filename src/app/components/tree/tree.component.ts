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



      this.createTree(this.familyTree);
      //Recibe un json con la estructura de la familia
      /*
          {
            "name": "Root",
            "children": [
              {
                "name": "Child 1",
                "children": [
                  {
                    "name": "Grandchild 1",
                    "children": [
                      { "name": "Great Grandchild 1" }, // Anidacion infinita
                      { "name": "Great Grandchild 2" }
                    ]

                  },
                  { "name": "Grandchild 2" }
                ]
              },
              {
                "name": "Child 2"
              }
            ]
          };

      */
    });
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
        .text((d:any) => d.data.name);
  }

}
