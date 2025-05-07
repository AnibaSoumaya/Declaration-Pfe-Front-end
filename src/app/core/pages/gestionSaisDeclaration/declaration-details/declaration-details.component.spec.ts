import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeclarationDetailsComponent } from './declaration-details.component';

describe('DeclarationDetailsComponent', () => {
  let component: DeclarationDetailsComponent;
  let fixture: ComponentFixture<DeclarationDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeclarationDetailsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DeclarationDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
