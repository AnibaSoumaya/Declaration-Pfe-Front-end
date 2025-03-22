import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParametreGenerauxComponent } from './parametre-generaux.component';

describe('ParametreGenerauxComponent', () => {
  let component: ParametreGenerauxComponent;
  let fixture: ComponentFixture<ParametreGenerauxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ParametreGenerauxComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ParametreGenerauxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
