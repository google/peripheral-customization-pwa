import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomizeButtonsComponent } from './customize-buttons.component';

describe('CustomizeButtonsComponent', () => {
  let component: CustomizeButtonsComponent;
  let fixture: ComponentFixture<CustomizeButtonsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CustomizeButtonsComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomizeButtonsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create component successfully', () => {
    expect(component).toBeTruthy();
  });
});
