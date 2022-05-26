/* eslint-disable no-useless-constructor */
import { Component } from '@angular/core';
import { MatSelectionListChange } from '@angular/material/list';
import { AssetsService } from 'src/app/assets.service';
import { ManagerService } from 'src/app/manager.service';
import { Zone } from 'src/app/model/zone';
import {
  Color,
  LEDColorRange,
  LEDZones,
} from 'src/lib/ts/devices/components/led';

@Component({
  selector: 'app-rgb-profile',
  templateUrl: './rgb-profile.component.html',
  styleUrls: ['./rgb-profile.component.scss'],
})
export class RgbProfileComponent {
  constructor(
    private managerService: ManagerService,
    private assetsService: AssetsService,
  ) {
    this.zonesMap = this.setZones();
  }

  settings: Color[] = [];

  mouseFrontImg = this.assetsService.getDeviceTopImgUri();

  zones: Array<Zone> = [];

  color = '';

  zonesMap: Map<LEDZones, Color> | undefined;

  hasColorPicker = false;

  selectedZone: Zone = {
    zone: LEDZones.ALL,
    colorRange: LEDColorRange.ALL_COLORS,
    color: { red: 0, green: 0, blue: 0 },
  };

  setZones(): Map<LEDZones, Color> | undefined {
    if (!this.managerService.ledCapabilities) {
      // eslint-disable-next-line no-console
      console.log('No zones found');
      return undefined;
    }
    Object.entries(this.managerService.ledCapabilities).forEach(pairs =>
      this.zones.push({
        zone: pairs[0] as LEDZones,
        colorRange: pairs[1],
        color: { red: 0, green: 0, blue: 0 },
      }),
    );
    const zonesMap: Map<LEDZones, Color> = this.zones.reduce(
      (map, zone) => map.set(zone.zone, zone.color),
      new Map(),
    );
    return zonesMap;
  }

  setRgbList(zone: Zone): void {
    switch (zone.colorRange) {
      case LEDColorRange.NONE:
        break;
      case LEDColorRange.SIMPLE_RGB:
        this.settings.push({ red: 255, green: 0, blue: 0 });
        this.settings.push({ red: 0, green: 255, blue: 0 });
        this.settings.push({ red: 0, green: 0, blue: 255 });
        break;
      case LEDColorRange.ALL_COLORS:
        this.hasColorPicker = true;
        break;
      default:
        break;
    }
  }

  chooseZone(zone: Zone): void {
    this.selectedZone = zone;
    this.setRgbList(zone);
  }

  handleColorPickClose(rgb: string): void {
    const color = this.rgbToColor(rgb);
    this.managerService.setLed(color, this.selectedZone.zone);
    this.selectedZone.color = color;
  }

  setRGBValue(event: MatSelectionListChange): void {
    const color = event.options[0].value as Color;
    this.managerService.setLed(color, this.selectedZone.zone);
    this.selectedZone.color = color;
  }

  rgbToColor(rgb: string): Color {
    const array = rgb
      .slice(3)
      .slice(1, -1)
      .split(',')
      .map(string => Number(string));
    return { red: array[0], green: array[1], blue: array[2] };
  }
}
