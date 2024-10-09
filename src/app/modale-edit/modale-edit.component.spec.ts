import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModaleEditComponent } from './modale-edit.component';

describe('ModaleEditComponent', () => {
  let component: ModaleEditComponent;
  let fixture: ComponentFixture<ModaleEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModaleEditComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModaleEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
