import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AdjustCpiComponent } from './adjust-cpi.component';

describe('AdjustCpiComponent', () => {
  let component: AdjustCpiComponent;
  let fixture: ComponentFixture<AdjustCpiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MatButtonToggleModule,
        MatSliderModule,
        MatInputModule,
        BrowserAnimationsModule,
      ],
      declarations: [AdjustCpiComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdjustCpiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create component successfully', () => {
    expect(component).toBeTruthy();
  });
});
