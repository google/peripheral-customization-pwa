import {
  Color,
  LEDColorRange,
  LEDZones,
} from 'src/lib/ts/devices/components/led';

export interface Zone {
  zone: LEDZones;
  colorRange: LEDColorRange;
  color: Color | undefined;
}
