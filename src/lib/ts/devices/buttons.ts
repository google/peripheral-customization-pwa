export enum ButtonBindings {
  DEFAULT = 'DEFAULT',
  MOUSE_BUTTON = 'MOUSE_BUTTON',
  DPI_CHANGE = 'DPI_CHANGE',
  KEYBOARD_KEY = 'KEYBOARD_KEY',
  MACRO = 'MACRO',
  UNDEFINED = 'UNDEFINED',
}

export enum MouseButtonPosition {
  LEFT = 0,
  RIGHT = 1,
  MIDDLE = 2,
  WHEEL_DOWN = 3,
  WHEEL_UP = 4,
  LEFT_FRONT = 5,
  LEFT_BACK = 6,
  RIGHT_FRONT = 7,
  RIGHT_BACK = 8,
  TOP = 9,
  UNDEFINED = 0xff,
}

export type MouseButtonMap = Record<MouseButtonPosition, number>;
export type KeyboardKeyMap = Record<string, number>;

export type BindTo = Record<ButtonBindings, MouseButtonMap | KeyboardKeyMap>;

export type ButtonsCapabilities = Record<MouseButtonPosition, BindTo>;
