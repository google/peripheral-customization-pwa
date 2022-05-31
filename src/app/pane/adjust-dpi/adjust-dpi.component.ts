import { Component, ChangeDetectorRef, OnInit } from '@angular/core';

import { AssetsService } from 'src/app/assets.service';
import { ManagerService } from 'src/app/manager.service';
import { dpi } from 'src/app/model/dpi';

@Component({
  selector: 'app-adjust-dpi',
  templateUrl: './adjust-dpi.component.html',
  styleUrls: ['./adjust-dpi.component.scss'],
})
export class AdjustDpiComponent implements OnInit {
  currentDpi: dpi | undefined;

  stages!: number[];

  defaultDpiValues!: number[];

  minDpi!: number;

  maxDpi!: number;

  step!: number;

  mouseBottomImg = this.assetsService.getDeviceBottomImgUri();

  selectedDpi!: number;

  selectedStage = 0;

  invertedLevels!: Record<number, number>;

  // eslint-disable-next-line no-useless-constructor
  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private assetsService: AssetsService,
    private manager: ManagerService,
  ) {}

  ngOnInit(): void {
    if (!this.manager.dpiCapabilities) return;
    const { dpiCapabilities } = this.manager;

    this.manager.requestDpiLevels().then(currentDpi => {
      this.currentDpi = currentDpi;

      this.stages = Array.from(
        { length: currentDpi.count },
        (_, i) => dpiCapabilities.levels[currentDpi.levels[i]],
      );

      // MOCK
      this.defaultDpiValues = Array.from(
        { length: currentDpi.count },
        () => 1500,
      );

      const levelsValues = Object.values(dpiCapabilities.levels);
      this.maxDpi = Math.max(...levelsValues);
      this.minDpi = Math.min(...levelsValues);

      this.step = (this.maxDpi - this.minDpi) / (levelsValues.length - 1);

      this.selectedStage = currentDpi.current;
      this.selectedDpi =
        dpiCapabilities.levels[currentDpi.levels[this.selectedStage]];

      this.invertedLevels = Object.entries(dpiCapabilities.levels).reduce(
        (acc, [key, value]) => ({ ...acc, [value]: parseInt(key, 10) }),
        {},
      );
    });
  }

  setDpiInput(stage: number, dpiValue: string): void {
    const oldValue = this.stages[stage];

    // Temporarily change value to force re-render
    this.stages[stage] = 0;
    this.changeDetectorRef.detectChanges();

    const parsedValue = dpiValue.match(/\d+/g)?.join(''); // Get only numbers
    const value = parsedValue ? Number(parsedValue) : oldValue;
    const filteredValue = Math.round(value / this.step) * this.step;
    if (filteredValue > this.maxDpi) {
      this.stages[stage] = this.maxDpi;
    } else if (filteredValue < this.minDpi) {
      this.stages[stage] = this.minDpi;
    } else {
      this.stages[stage] = filteredValue;
    }
    this.selectedDpi = this.stages[stage];
    // eslint-disable-next-line no-console
    console.log(`Stage ${stage} set to ${this.stages[stage]} dpi value`);
    this.manager.setDpiLevel(
      stage,
      this.getKeyFromDpiValue(this.stages[stage]),
    );
  }

  setDpiSlider(dpiValue: number): void {
    this.selectedDpi = dpiValue;
    this.stages[this.selectedStage] = dpiValue;
    // eslint-disable-next-line no-console
    console.log(`Stage ${this.selectedStage} set to ${dpiValue} dpi value`);
    this.manager.setDpiLevel(
      this.selectedStage,
      this.getKeyFromDpiValue(dpiValue),
    );
  }

  changeStage(stage: number): void {
    this.selectedStage = stage;
    this.selectedDpi = this.stages[stage];
    this.manager.changeCurrentDpi(stage);
  }

  resetToDefault(): void {
    this.stages = [...this.defaultDpiValues];

    // Temporarily change value to force re-render
    this.selectedDpi = 0;
    this.changeDetectorRef.detectChanges();

    this.selectedDpi = this.stages[this.selectedStage];

    // eslint-disable-next-line no-console
    console.log('Reset to default settings');
    this.stages.forEach((_, i) => {
      this.manager.setDpiLevel(
        i,
        this.getKeyFromDpiValue(this.defaultDpiValues[i]),
      );
    });
  }

  private getKeyFromDpiValue(dpiValue: number): number {
    return this.invertedLevels[dpiValue];
  }
}
