import { Component, OnInit } from '@angular/core';
import { AssetsService } from 'src/app/assets.service';
import { ManagerService } from 'src/app/manager.service';

import {
  Inputs,
  InputTypes,
  KeyBinding,
} from 'src/lib/ts/devices/components/inputs';

@Component({
  selector: 'app-customize-buttons',
  templateUrl: './customize-buttons.component.html',
  styleUrls: ['./customize-buttons.component.scss'],
})
export class CustomizeButtonsComponent implements OnInit {
  inputCapabilities = this.managerService.inputCapabilities ?? {};

  deviceInputs = Object.keys(this.inputCapabilities) as Inputs[];

  selectedDeviceInput!: Inputs;

  bindToList: Inputs[] = [];

  selectedBindTo!: Inputs | '';

  mouseTopImg = this.assetsService.getDeviceTopImgUri();

  // eslint-disable-next-line no-useless-constructor
  constructor(
    private assetsService: AssetsService,
    private managerService: ManagerService,
  ) {}

  ngOnInit(): void {
    this.selectDeviceInput(this.deviceInputs[0]);
  }

  selectDeviceInput(deviceInput: Inputs): void {
    this.selectedDeviceInput = deviceInput;
    this.bindToList = this.inputCapabilities[deviceInput] ?? [];
    this.selectedBindTo = '';
  }

  changeBindTo(): void {
    if (!this.selectedBindTo) return;

    const keyBinding: KeyBinding = {
      source: {
        key: this.selectedDeviceInput,
        type: InputTypes.MOUSE_BUTTON,
      },
      bindTo: {
        key: this.selectedBindTo,
        type: InputTypes.KEYBOARD_KEY,
      },
    };
    this.managerService.setInput(keyBinding);
  }
}
