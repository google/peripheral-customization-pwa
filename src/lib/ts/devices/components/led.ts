export enum LEDColorRange {
  NONE = 'NONE',
  SIMPLE_RGB = 'SIMPLE_RGB',
  ALL_COLORS = 'ALL_COLORS',
}

export enum LEDZones {
  ALL = 'ALL',
  BACK = 'BACK',
  MIDDLE = 'MIDDLE',
  FRONT = 'FRONT',
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
  SCROLL = 'SCROLL',
  LOGO = 'LOGO',
}

export enum LEDModes {
  STATIC = 'STATIC',
  BREATHING = 'BREATHING',
}

export type LEDCapabilities = Partial<Record<LEDZones, LEDColorRange>>;

export type Color = {
  red: number;
  green: number;
  blue: number;
};

// Check if order is a permutation of the characters 'r', 'g' and 'b'
const rgbRegx = /^(?:([rgb])(?!.*\1)){3}$/;

const charToColor: Record<string, keyof Color> = {
  r: 'red',
  g: 'green',
  b: 'blue',
} as const;

export const colorToArray = (color: Color, order = 'rgb'): number[] => {
  if (!rgbRegx.test(order)) throw Error('Invalid color order');

  return Array.from(order).map(char => color[charToColor[char]]);
};
