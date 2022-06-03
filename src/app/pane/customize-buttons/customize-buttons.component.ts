import { Component, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { AssetsService } from 'src/app/assets.service';
import { ManagerService } from 'src/app/manager.service';

import {
  Input,
  InputBindings,
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

  inputButtons = Object.keys(this.inputCapabilities) as Input[];

  inputBindings?: InputBindings;

  selectedButton$ = new BehaviorSubject<Input | undefined>(undefined);

  selectedBindToType?: InputType;

  selectedBindToKey?: Input;

  mouseTopImg = this.assetsService.getDeviceTopImgUri();

  // eslint-disable-next-line no-useless-constructor
  constructor(
    private assetsService: AssetsService,
    private managerService: ManagerService,
  ) {}

  ngOnInit(): void {
    this.managerService.requestInputBindings().then(inputBindings => {
      this.inputBindings = inputBindings;
    });
  }

  selectKey(button: Input): void {
    this.selectedButton$.next(button);

    this.selectedBindToType = this.inputBindings?.[button]?.bindTo.type;
    this.selectedBindToKey = this.inputBindings?.[button]?.bindTo.key;
  }

  bindToTypes(selectedButton: Input): InputType[] {
    const bindToList = this.inputCapabilities[selectedButton];
    return [...new Set(bindToList?.map(input => input.type))];
  }

  bindToKeys(selectedButton: Input): Input[] {
    if (!this.selectedBindToType) return [];

    const inputs =
      this.inputCapabilities[selectedButton]?.filter(
        input => input.type === this.selectedBindToType,
      ) ?? [];

    return inputs.map(input => input.key);
  }

  changeBindTo(selectedButton: Input): void {
    if (!selectedButton || !this.selectedBindToKey) return;

    if (selectedButton === this.selectedBindToKey) {
      this.selectedBindToType = InputType.MOUSE_BUTTON;
    }

    if (!this.selectedBindToType) return;

    const keyBinding: KeyBinding = {
      key: selectedButton,
      bindTo: { key: this.selectedBindToKey, type: this.selectedBindToType },
    };

    this.managerService.setInput(keyBinding).then(() => {
      // TODO: Add proper component for user feedback
      // eslint-disable-next-line no-console
      console.log('Input was set');
      if (this.inputBindings) this.inputBindings[selectedButton] = keyBinding;
    });
  }

  resetToDefault(): void {
    if (!this.inputBindings) return;
    Object.entries(this.inputBindings).forEach(([button, biding]) => {
      const defaultType = this.inputBindings?.[biding.key]?.bindTo.type;
      if (!defaultType || biding.key === biding.bindTo.key) return;
      const defaultKeyBiding: KeyBinding = {
        key: biding.key,
        bindTo: { key: biding.key, type: defaultType },
      };
      this.managerService.setInput(defaultKeyBiding).then(() => {
        // TODO: Add proper component for user feedback
        // eslint-disable-next-line no-console
        console.log('Input was set');
      });

      if (!this.inputBindings) return;
      this.inputBindings[button as Input] = defaultKeyBiding;
    });

    if (!this.selectedButton$.value) return;
    this.selectKey(this.selectedButton$.value);
  }
}
