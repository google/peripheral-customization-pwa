import type { Color } from './devices/led';

const htmlRgbRegx = /^#([0-9a-fA-F]){6}$/;

export const htmlRGBToColor = (rgbString: string): Color => {
  if (!htmlRgbRegx.test(rgbString)) {
    // eslint-disable-next-line no-console
    console.log('Bad color provided, setting LED to red...');
    return { red: 0xff, green: 0x00, blue: 0x00 };
  }
  return {
    red: parseInt(rgbString.substring(1, 3), 16),
    green: parseInt(rgbString.substring(3, 5), 16),
    blue: parseInt(rgbString.substring(5, 7), 16),
  };
};

export const byteArrayToString = (data: Uint8Array): string =>
  Array.from(data)
    .map(byte => String.fromCharCode(byte))
    .join('');
