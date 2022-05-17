import { Component, Input } from '@angular/core';
import { AssetsService } from 'src/app/assets.service';

@Component({
  selector: 'app-customize-buttons',
  templateUrl: './customize-buttons.component.html',
  styleUrls: ['./customize-buttons.component.scss'],
})
export class CustomizeButtonsComponent {
  @Input() buttons = [
    {
      id: 'left',
      name: 'Left Click',
      macro: 'left',
    },
    {
      id: 'right',
      name: 'Right Click',
      macro: 'right',
    },
    {
      id: 'button1',
      name: 'Button 1',
      macro: 'none',
    },
    {
      id: 'button2',
      name: 'Button 2',
      macro: 'none',
    },
  ];

  mouseTopImg = this.assetsService.getDeviceTopImgUri();

  buttonsMap = this.buttons.reduce(
    (map, btn) => map.set(btn.id, btn),
    new Map(),
  );

  selectedButton = this.buttons[0];

  selectedButtonMacro = this.buttons[0].macro;

  // eslint-disable-next-line no-useless-constructor
  constructor(private assetsService: AssetsService) {}

  chooseButton(id: string): void {
    this.selectedButton = this.buttonsMap.get(id);
    this.selectedButtonMacro = this.selectedButton.macro;
  }

  setMacro(macro: string): void {
    // eslint-disable-next-line no-console
    console.log(`Button '${this.selectedButton}' is mapped to ${macro}`);
    this.selectedButton.macro = macro;
  }
}
