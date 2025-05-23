import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BIComponent } from './bi.component';

describe('BIComponent', () => {
  let component: BIComponent;
  let fixture: ComponentFixture<BIComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BIComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BIComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
