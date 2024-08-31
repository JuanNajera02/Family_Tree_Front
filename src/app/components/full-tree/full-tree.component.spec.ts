import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FullTreeComponent } from './full-tree.component';

describe('FullTreeComponent', () => {
  let component: FullTreeComponent;
  let fixture: ComponentFixture<FullTreeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FullTreeComponent]
    });
    fixture = TestBed.createComponent(FullTreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
