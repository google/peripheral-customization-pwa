import { Component, Input } from '@angular/core';
import { MatSelectionListChange } from '@angular/material/list';
import { Zone } from 'src/app/model/zone';
import { AssetsService } from 'src/app/assets.service';

@Component({
  selector: 'app-rgb-profile',
  templateUrl: './rgb-profile.component.html',
  styleUrls: ['./rgb-profile.component.scss'],
})
export class RgbProfileComponent {
  @Input() settings: string[] = [
    'Red hues',
    'Green hues',
    'Blue hues',
    'Random',
    'Brightness',
  ];

  mouseFrontImg = this.assetsService.getDeviceTopImgUri();

  @Input() zones: Array<Zone> = [
    {
      id: '1',
      value: 'Red Hues',
    },
    {
      id: '2',
      value: 'Green Hues',
    },
    {
      id: '3',
      value: 'Blue Hues',
    },
  ];

  zonesMap = this.zones.reduce(
    (map, zone) => map.set(zone.id, zone),
    new Map(),
  );

  selectedZone: Zone = {
    id: '0',
    value: 'default',
  };

  // eslint-disable-next-line no-useless-constructor
  constructor(private assetsService: AssetsService) {}

  chooseZone(id: string): void {
    this.selectedZone = this.zonesMap.get(id);
  }

  setRGBValue(event: MatSelectionListChange): void {
    this.selectedZone.value = event.options[0].value;
  }
}
