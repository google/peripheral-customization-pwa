import { Component } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  batteryLife = 0;
  firmwareVersion = '0.0.00';
  title = 'Model11';

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor() {}
}
