import { Component, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';

import { Subscription } from 'rxjs';
import { AssetsService } from 'src/app/assets.service';
import { ManagerService } from 'src/app/manager.service';
import { cpi, CpiValue } from 'src/app/model/cpi';

@Component({
  selector: 'app-adjust-cpi',
  templateUrl: './adjust-cpi.component.html',
  styleUrls: ['./adjust-cpi.component.scss'],
})
export class AdjustCpiComponent implements OnInit, OnDestroy {
  currentCpi?: cpi;

  stages!: number[];

  defaultCpiValues!: number[];

  minCpi!: number;

  maxCpi!: number;

  step!: number;

  mouseBottomImg = this.assetsService.getDeviceBottomImgUri();

  selectedCpi!: number;

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
    if (!this.manager.cpiCapabilities) return;
    const { cpiCapabilities } = this.manager;

    this.manager.requestCpiLevels().then(currentCpi => {
      this.currentCpi = currentCpi;

      this.stages = Array.from(
        { length: currentCpi.count },
        (_, i) => cpiCapabilities.levels[currentCpi.levels[i]],
      );

      // MOCK
      this.defaultCpiValues = Array.from(
        { length: currentCpi.count },
        () => 1500,
      );

      const levelsValues = Object.values(cpiCapabilities.levels);
      this.maxCpi = Math.max(...levelsValues);
      this.minCpi = Math.min(...levelsValues);

      this.step = (this.maxCpi - this.minCpi) / (levelsValues.length - 1);

      this.selectedStage = currentCpi.current;
      this.selectedCpi =
        cpiCapabilities.levels[currentCpi.levels[this.selectedStage]];

      this.invertedLevels = Object.entries(cpiCapabilities.levels).reduce(
        (acc, [key, value]) => ({ ...acc, [value]: parseInt(key, 10) }),
        {},
      );

      this.deviceSubscription = this.manager.currentCpiStageSubject.subscribe(
        stage => {
          if (stage === undefined) return;
          this.selectedStage = stage;
          this.selectedCpi = this.stages[stage];
        },
      );
    });
  }

  ngOnDestroy(): void {
    this.deviceSubscription.unsubscribe();
  }

  setCpiInput(stage: number, cpiValue: string): void {
    // Temporarily change value to force re-render
    const currentStages = this.stages;
    this.stages = new Array(this.stages.length).fill(0);
    this.changeDetectorRef.detectChanges();
    this.stages = currentStages;

    if (!cpiValue.match(/^[0-9]*$/g)?.join('')) return; // Get only numbers
    const value = Number(cpiValue);
    const filteredValue = Math.round(value / this.step) * this.step;
    if (filteredValue > this.maxCpi) this.stages[stage] = this.maxCpi;
    else if (filteredValue < this.minCpi) this.stages[stage] = this.minCpi;
    else this.stages[stage] = filteredValue;
    this.manager
      .setCpiLevel(stage, this.getKeyFromCpiValue(this.stages[stage]))
      .then((setCpiValue: CpiValue) => {
        // eslint-disable-next-line no-console
        console.log(
          `CPI for id ${setCpiValue.id + 1} was set to ${setCpiValue.level}`,
        );
      });
    if (stage !== this.selectedStage) this.changeStage(stage);
    this.selectedCpi = this.stages[stage];
  }

  setCpiSlider(cpiValue: number): void {
    this.selectedCpi = cpiValue;
    this.stages[this.selectedStage] = cpiValue;
    this.manager
      .setCpiLevel(this.selectedStage, this.getKeyFromCpiValue(cpiValue))
      .then((setCpiValue: CpiValue) => {
        // eslint-disable-next-line no-console
        console.log(
          `CPI for id ${setCpiValue.id + 1} was set to ${setCpiValue.level}`,
        );
      });
  }

  changeStage(stage: number): void {
    this.selectedStage = stage;
    this.selectedCpi = this.stages[stage];
    this.manager.changeCurrentCpi(
      stage,
      this.getKeyFromCpiValue(this.selectedCpi),
    );
  }

  resetToDefault(): void {
    this.stages = [...this.defaultCpiValues];

    this.selectedCpi = this.stages[this.selectedStage];

    // eslint-disable-next-line no-console
    console.log('Reset to default settings');
    this.stages.forEach((_, i) => {
      this.manager
        .setCpiLevel(i, this.getKeyFromCpiValue(this.defaultCpiValues[i]))
        .then((setCpiValue: CpiValue) => {
          // eslint-disable-next-line no-console
          console.log(
            `CPI for id ${setCpiValue.id + 1} was set to ${setCpiValue.level}`,
          );
        });
    });
  }

  private getKeyFromCpiValue(cpiValue: number): number {
    return this.invertedLevels[cpiValue];
  }
}
