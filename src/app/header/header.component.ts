import { Component, OnInit } from '@angular/core';

import { AssetsService } from 'src/app/assets.service';
import { ManagerService } from 'src/app/manager.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  batteryLife = 'Wired Device';

  firmwareVersion = 'unknown';

  title = this.assetsService.getDeviceName();

  // eslint-disable-next-line no-useless-constructor
  constructor(
    private assetsService: AssetsService,
    private managerService: ManagerService,
  ) {}

  ngOnInit(): void {
    this.managerService.requestFirmwareVersion().then(firmwareVersion => {
      this.firmwareVersion = firmwareVersion;
    });

    this.managerService.requestBatteryLife().then(batteryLife => {
      this.batteryLife = `Remaining Battery Life: ${batteryLife}%`;
    });
  }
}
