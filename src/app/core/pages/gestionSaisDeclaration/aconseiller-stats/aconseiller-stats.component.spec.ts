import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AConseillerStatsComponent } from './aconseiller-stats.component';

describe('AConseillerStatsComponent', () => {
  let component: AConseillerStatsComponent;
  let fixture: ComponentFixture<AConseillerStatsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AConseillerStatsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AConseillerStatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
