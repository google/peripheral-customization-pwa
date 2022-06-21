import { Component, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';

import { AssetsService } from 'src/app/assets.service';
import { ManagerService } from 'src/app/manager.service';
import { dpi, DpiValue } from 'src/app/model/dpi';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-adjust-dpi',
  templateUrl: './adjust-dpi.component.html',
  styleUrls: ['./adjust-dpi.component.scss'],
})
export class AdjustDpiComponent implements OnInit, OnDestroy {
  currentDpi?: dpi;

  stages!: number[];

  defaultDpiValues!: number[];

  minDpi!: number;

  maxDpi!: number;

  step!: number;

  mouseBottomImg = this.assetsService.getDeviceBottomImgUri();

  selectedDpi!: number;

  selectedStage!: number;

  invertedLevels!: Record<number, number>;

  deviceSubscription!: Subscription;

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

      this.deviceSubscription = this.manager.currentDpiStageSubject.subscribe(
        stage => {
          if (stage === undefined) return;
          this.selectedStage = stage;
          this.selectedDpi = this.stages[stage];
        },
      );
    });
  }

  ngOnDestroy(): void {
    this.deviceSubscription.unsubscribe();
  }

  setDpiInput(stage: number, dpiValue: string): void {
    // Temporarily change value to force re-render
    const currentStages = this.stages;
    this.stages = new Array(this.stages.length).fill(0);
    this.changeDetectorRef.detectChanges();
    this.stages = currentStages;

    if (!dpiValue.match(/^[0-9]*$/g)?.join('')) return; // Get only numbers
    const value = Number(dpiValue);
    const filteredValue = Math.round(value / this.step) * this.step;
    if (filteredValue > this.maxDpi) this.stages[stage] = this.maxDpi;
    else if (filteredValue < this.minDpi) this.stages[stage] = this.minDpi;
    else this.stages[stage] = filteredValue;
    this.manager
      .setDpiLevel(stage, this.getKeyFromDpiValue(this.stages[stage]))
      .then((setDpiValue: DpiValue) => {
        // eslint-disable-next-line no-console
        console.log(
          `DPI for id ${setDpiValue.id + 1} was set to ${setDpiValue.level}`,
        );
      });
    if (stage !== this.selectedStage) this.changeStage(stage);
    this.selectedDpi = this.stages[stage];
  }

  setDpiSlider(dpiValue: number): void {
    this.selectedDpi = dpiValue;
    this.stages[this.selectedStage] = dpiValue;
    this.manager
      .setDpiLevel(this.selectedStage, this.getKeyFromDpiValue(dpiValue))
      .then((setDpiValue: DpiValue) => {
        // eslint-disable-next-line no-console
        console.log(
          `DPI for id ${setDpiValue.id + 1} was set to ${setDpiValue.level}`,
        );
      });
  }

  changeStage(stage: number): void {
    this.selectedStage = stage;
    this.selectedDpi = this.stages[stage];
    this.manager.changeCurrentDpi(
      stage,
      this.getKeyFromDpiValue(this.selectedDpi),
    );
  }

  resetToDefault(): void {
    this.stages = [...this.defaultDpiValues];

    this.selectedDpi = this.stages[this.selectedStage];

    // eslint-disable-next-line no-console
    console.log('Reset to default settings');
    this.stages.forEach((_, i) => {
      this.manager
        .setDpiLevel(i, this.getKeyFromDpiValue(this.defaultDpiValues[i]))
        .then((setDpiValue: DpiValue) => {
          // eslint-disable-next-line no-console
          console.log(
            `DPI for id ${setDpiValue.id + 1} was set to ${setDpiValue.level}`,
          );
        });
    });
  }

  private getKeyFromDpiValue(dpiValue: number): number {
    return this.invertedLevels[dpiValue];
  }
}
