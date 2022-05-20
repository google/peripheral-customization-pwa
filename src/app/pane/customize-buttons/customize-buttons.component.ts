import { Component, OnInit } from '@angular/core';

import { AssetsService } from 'src/app/assets.service';
import { ManagerService } from 'src/app/manager.service';

import {
  Input,
  InputCapability,
  InputType,
  KeyBinding,
} from 'src/lib/ts/devices/components/inputs';

@Component({
  selector: 'app-customize-buttons',
  templateUrl: './customize-buttons.component.html',
  styleUrls: ['./customize-buttons.component.scss'],
})
export class CustomizeButtonsComponent implements OnInit {
  inputCapabilities = this.managerService.inputCapabilities ?? {};

  keys = Object.keys(this.inputCapabilities) as Input[];

  bindToTypes: InputType[] = [];

  bindToList: InputCapability[] = [];

  bindToDefault?: InputCapability;

  selectedKey?: Input;

  selectedBindToType?: InputType;

  selectedBindTo?: InputCapability;

  mouseTopImg = this.assetsService.getDeviceTopImgUri();

  // eslint-disable-next-line no-useless-constructor
  constructor(
    private assetsService: AssetsService,
    private managerService: ManagerService,
  ) {}

  ngOnInit(): void {
    this.selectKey(this.keys[0]);
  }

  selectKey(key: Input): void {
    this.selectedKey = key;
    this.bindToList = this.inputCapabilities[key] ?? [];
    this.bindToTypes = [...new Set(this.bindToList.map(input => input.type))];
    this.bindToDefault = { key, type: InputType.MOUSE_BUTTON };

    this.selectedBindToType = undefined;
    this.selectedBindTo = undefined;
  }

  filterType(): void {
    if (!this.selectedKey) return;

    this.bindToList =
      this.inputCapabilities[this.selectedKey]?.filter(
        input => input.type === this.selectedBindToType,
      ) ?? [];
  }

  changeBindTo(): void {
    if (!this.selectedKey || !this.selectedBindTo) return;

    const keyBinding: KeyBinding = {
      key: this.selectedKey,
      bindTo: this.selectedBindTo,
    };

    this.managerService.setInput(keyBinding);
  }
}
