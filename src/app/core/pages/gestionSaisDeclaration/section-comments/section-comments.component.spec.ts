import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SectionCommentsComponent } from './section-comments.component';

describe('SectionCommentsComponent', () => {
  let component: SectionCommentsComponent;
  let fixture: ComponentFixture<SectionCommentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SectionCommentsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SectionCommentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
