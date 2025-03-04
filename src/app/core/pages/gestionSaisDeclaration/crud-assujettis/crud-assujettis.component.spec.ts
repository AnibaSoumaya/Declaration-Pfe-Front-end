import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrudAssujettisComponent } from './crud-assujettis.component';

describe('CrudAssujettisComponent', () => {
  let component: CrudAssujettisComponent;
  let fixture: ComponentFixture<CrudAssujettisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrudAssujettisComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CrudAssujettisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
