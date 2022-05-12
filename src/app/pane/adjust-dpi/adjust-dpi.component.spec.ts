import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AdjustDpiComponent } from './adjust-dpi.component';

describe('AdjustDpiComponent', () => {
  let component: AdjustDpiComponent;
  let fixture: ComponentFixture<AdjustDpiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MatButtonToggleModule,
        MatSliderModule,
        MatInputModule,
        BrowserAnimationsModule,
      ],
      declarations: [AdjustDpiComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdjustDpiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create component successfully', () => {
    expect(component).toBeTruthy();
  });
});
