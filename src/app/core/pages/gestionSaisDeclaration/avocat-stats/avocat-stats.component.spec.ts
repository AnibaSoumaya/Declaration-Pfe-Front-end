import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AvocatStatsComponent } from './avocat-stats.component';

describe('AvocatStatsComponent', () => {
  let component: AvocatStatsComponent;
  let fixture: ComponentFixture<AvocatStatsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AvocatStatsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AvocatStatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
