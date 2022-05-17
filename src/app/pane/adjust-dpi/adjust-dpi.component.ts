import { Component, Input, ChangeDetectorRef } from '@angular/core';
import { AssetsService } from 'src/app/assets.service';

@Component({
  selector: 'app-adjust-dpi',
  templateUrl: './adjust-dpi.component.html',
  styleUrls: ['./adjust-dpi.component.scss'],
})
export class AdjustDpiComponent {
  @Input() stages = [800, 4500, 8000];

  @Input() defaultDpiValues = [800, 1000, 1200];

  @Input() minDpi = 100;

  @Input() maxDpi = 9000;

  mouseBottomImg = this.assetsService.getDeviceBottomImgUri();

  selectedDpi = this.stages[0];

  selectedStage = 0;

  // eslint-disable-next-line no-useless-constructor
  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private assetsService: AssetsService,
  ) {}

  changeStage(stage: number): void {
    this.selectedStage = stage;
  }

  setDpiInput(stage: number, dpiValue: string): void {
    const oldValue = this.stages[stage];

    // Temporarily change value to force re-render
    this.stages[stage] = 0;
    this.changeDetectorRef.detectChanges();

    const parsedValue = dpiValue.match(/\d+/g)?.join(''); // Get only numbers
    const value = parsedValue ? Number(parsedValue) : oldValue;
    if (value > this.maxDpi) {
      this.stages[stage] = this.maxDpi;
    } else if (value < this.minDpi) {
      this.stages[stage] = this.minDpi;
    } else {
      this.stages[stage] = value;
    }
    this.selectedDpi = this.stages[stage];
    // eslint-disable-next-line no-console
    console.log(`Stage ${stage} set to ${this.stages[stage]} dpi value`);
  }

  setDpiSlider(dpiValue: number): void {
    this.stages[this.selectedStage] = dpiValue;
    // eslint-disable-next-line no-console
    console.log(
      `Stage ${this.selectedStage} set to ${this.stages[dpiValue]} dpi value`,
    );
  }

  changeButton(checked: boolean): void {
    if (checked) this.selectedDpi = this.stages[this.selectedStage];
  }

  resetToDefault(): void {
    this.stages = [...this.defaultDpiValues];

    // Temporarily change value to force re-render
    this.selectedDpi = 0;
    this.changeDetectorRef.detectChanges();

    this.selectedDpi = this.stages[this.selectedStage];

    // eslint-disable-next-line no-console
    console.log('Reset to default settings');
  }
}
