import { Injectable } from '@angular/core';
import assetsById from 'src/assets/assetsById';
import type { Assets } from 'src/assets/assetsById';

@Injectable({
  providedIn: 'root',
})
export class AssetsService {
  // TODO: get vendorId and deviceId from local storage.
  vendorId = '0002';

  deviceId = '2001';

  device!: Assets;

  constructor() {
    try {
      this.device = assetsById[this.vendorId][this.deviceId];
    } catch (e) {
      throw new Error('vendorId or deviceId not found');
    }
  }

  getDeviceName(): string {
    return this.device.deviceName;
  }

  getDeviceLogo(): string {
    return this.device.logoUri;
  }

  getDeviceBottomImgUri(): string {
    return this.device.deviceBottomImgUri;
  }

  getDeviceTopImgUri(): string {
    return this.device.deviceTopImgUri;
  }
}
