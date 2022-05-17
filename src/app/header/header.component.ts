import { Component } from '@angular/core';
import { AssetsService } from 'src/app/assets.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  batteryLife = 0;

  firmwareVersion = '0.0.00';

  title = this.assetsService.getDeviceName();

  // eslint-disable-next-line no-useless-constructor
  constructor(private assetsService: AssetsService) {}
}
