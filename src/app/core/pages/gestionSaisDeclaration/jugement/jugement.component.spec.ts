import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JugementComponent } from './jugement.component';

describe('JugementComponent', () => {
  let component: JugementComponent;
  let fixture: ComponentFixture<JugementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JugementComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(JugementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
