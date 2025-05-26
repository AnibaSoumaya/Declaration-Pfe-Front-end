import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonHistoriqueComponent } from './mon-historique.component';

describe('MonHistoriqueComponent', () => {
  let component: MonHistoriqueComponent;
  let fixture: ComponentFixture<MonHistoriqueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MonHistoriqueComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MonHistoriqueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
