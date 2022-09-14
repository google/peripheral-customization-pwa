import { Injectable } from '@angular/core';
import assetsById from 'src/assets/assetsById';
import type { Assets } from 'src/assets/assetsById';
import { ManagerService } from './manager.service';

@Injectable({
  providedIn: 'root',
})
export class AssetsService {
  device!: Assets;

  constructor(private managerService: ManagerService) {
    try {
      const vendorId = this.managerService.device?.hidDevice.vendorId ?? 0;
      const productId = this.managerService.device?.hidDevice.productId ?? 0;
      this.device = assetsById[vendorId][productId];
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
