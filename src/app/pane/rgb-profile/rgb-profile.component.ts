/* eslint-disable no-useless-constructor */
import { Component, OnInit } from '@angular/core';
import { MatSelectionListChange } from '@angular/material/list';
import { AssetsService } from 'src/app/assets.service';
import { ManagerService } from 'src/app/manager.service';
import { SimpleColor } from 'src/app/model/simple-color';
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
export class RgbProfileComponent implements OnInit {
  constructor(
    private managerService: ManagerService,
    private assetsService: AssetsService,
  ) {}

  settings: SimpleColor[] = [];

  mouseFrontImg = this.assetsService.getDeviceTopImgUri();

  zones: Array<Zone> = [];

  color = '';

  colorPickerSetting: SimpleColor = {
    name: '',
    color: { red: 255, blue: 255, green: 255 },
  };

  hasColorPicker = false;

  hasZoneSelected = false;

  selectedZone: Zone = {
    zone: LEDZones.ALL,
    colorRange: LEDColorRange.ALL_COLORS,
    color: { red: 0, green: 0, blue: 0 },
  };

  ngOnInit(): void {
    this.setZones();
    if (this.hasSingleZone()) {
      this.chooseZone(this.zones[0]);
    }
  }

  setZones(): void {
    if (!this.managerService.ledCapabilities) {
      // eslint-disable-next-line no-console
      console.log('No zones found');
    } else {
      Object.entries(this.managerService.ledCapabilities).forEach(
        ([zone, colorRange]) =>
          this.zones.push({
            zone: zone as LEDZones,
            colorRange,
            color: { red: 0, green: 0, blue: 0 },
          }),
      );
    }
  }

  setRgbList(zone: Zone): void {
    this.settings = [];
    this.hasColorPicker = false;
    switch (zone.colorRange) {
      case LEDColorRange.NONE:
        break;
      case LEDColorRange.SIMPLE_RGB:
        this.addColorsToSettings();
        break;
      case LEDColorRange.ALL_COLORS:
        this.addColorsToSettings();
        this.hasColorPicker = true;
        break;
      default:
        break;
    }
  }

  chooseZone(zone: Zone): void {
    this.selectedZone = zone;
    this.hasZoneSelected = true;
    this.setRgbList(zone);
  }

  hasSingleZone(): boolean {
    return this.zones.length === 1;
  }

  setRGBValue(event: MatSelectionListChange): void {
    const color = event.options[0].value.color as Color;
    this.managerService.setLed(color, this.selectedZone.zone).then(() => {
      // TODO: Add proper component for user feedback
      // eslint-disable-next-line no-console
      console.log('LED was set');
    });
    this.selectedZone.color = color;
  }

  addColorsToSettings(): void {
    this.settings.push({
      color: { red: 255, green: 0, blue: 0 },
      name: 'Red Hues',
    });
    this.settings.push({
      color: { red: 0, green: 255, blue: 0 },
      name: 'Green Hues',
    });
    this.settings.push({
      color: { red: 0, green: 0, blue: 255 },
      name: 'Blue Hues',
    });
  }

  handleColorPickClose(rgb: string): void {
    const color = this.rgbToColor(rgb);
    this.colorPickerSetting = {
      name: '',
      color,
    };
    this.managerService.setLed(color, this.selectedZone.zone).then(() => {
      // TODO: Add proper component for user feedback
      // eslint-disable-next-line no-console
      console.log('LED was set');
    });
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
