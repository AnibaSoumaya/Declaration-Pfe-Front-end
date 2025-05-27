import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AProcureurStatsComponent } from './aprocureur-stats.component';

describe('AProcureurStatsComponent', () => {
  let component: AProcureurStatsComponent;
  let fixture: ComponentFixture<AProcureurStatsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AProcureurStatsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AProcureurStatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
