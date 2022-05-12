import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RgbProfileComponent } from './rgb-profile.component';

describe('RgbProfileComponent', () => {
  let component: RgbProfileComponent;
  let fixture: ComponentFixture<RgbProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RgbProfileComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RgbProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create component successfully', () => {
    expect(component).toBeTruthy();
  });
});
