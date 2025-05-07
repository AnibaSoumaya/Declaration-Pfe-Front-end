import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ControleDeclarationComponent } from './controle-declaration.component';

describe('ControleDeclarationComponent', () => {
  let component: ControleDeclarationComponent;
  let fixture: ComponentFixture<ControleDeclarationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ControleDeclarationComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ControleDeclarationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
