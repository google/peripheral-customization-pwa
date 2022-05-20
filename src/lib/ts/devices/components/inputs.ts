export enum InputType {
  DEFAULT = 'DEFAULT',
  MOUSE_BUTTON = 'MOUSE_BUTTON',
  DPI_CHANGE = 'DPI_CHANGE',
  KEYBOARD_KEY = 'KEYBOARD_KEY',
  MACRO = 'MACRO',
  UNDEFINED = 'UNDEFINED',
}

export enum MouseInput {
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
  MIDDLE = 'MIDDLE',
  WHEEL_DOWN = 'WHEEL_DOWN',
  WHEEL_UP = 'WHEEL_UP',
  LEFT_FRONT = 'LEFT_FRONT',
  LEFT_BACK = 'LEFT_BACK',
  RIGHT_FRONT = 'RIGHT_FRONT',
  RIGHT_BACK = 'RIGHT_BACK',
  TOP = 'TOP',
}

export enum KeyboardInput {
  // TODO: Fill w/ all the keys
  KEYBOARD_KEY_CHANGE = 'KEYBOARD_KEY_CHANGE',
  SHORT_KEY = 'SHORT_KEY',
  VOL_UP = 'VOL_UP',
  VOL_DOW = 'VOL_DOW',
  MUTE = 'MUTE',
  PLAY_PAUSE = 'PLAY_PAUSE',
  STOP = 'STOP',
  PREVIOUS = 'PREVIOUS',
  NEXT = 'NEXT',
  MEDIA = 'MEDIA',
  MY_COMPUTER = 'MY_COMPUTER',
  MAIL = 'MAIL',
  CALCULATOR = 'CALCULATOR',
  WWW_HOME = 'WWW_HOME',
  WWW_SEARCH = 'WWW_SEARCH',
  WWW_BACK = 'WWW_BACK',
  WWW_FOWARD = 'WWW_FOWARD',
  WWW_STOP = 'WWW_STOP',
  WWW_REFRESH = 'WWW_REFRESH',
  WWW_FAVORITES = 'WWW_FAVORITES',
  LEFT_BUTTON = 'LEFT_BUTTON',
  RIGHT_BUTTON = 'RIGHT_BUTTON',
  MIDDLE_BUTTON = 'MIDDLE_BUTTON',
  K4_BUTTON = 'K4_BUTTON',
  K5_BUTTON = 'K5_BUTTON',
  WHEEL_INC = 'WHEEL_INC',
  WHEEL_DEC = 'WHEEL_DEC',
  LEFT_MOVE = 'LEFT_MOVE',
  RIGHT_MOVE = 'RIGHT_MOVE',
  DOUBLE_CLICK_LEFT = 'DOUBLE_CLICK_LEFT',
  CICLE_DPI = 'CICLE_DPI',
  DPI_UP = 'DPI_UP',
  DPI_DOWN = 'DPI_DOWN',
  MACROS_ID = 'MACROS_ID',
}

export type Input = MouseInput | KeyboardInput;

export type InputMap = Partial<Record<Input, number>>;

export type InputCapability = {
  key: Input;
  type: InputType;
};

export type InputCapabilities = Partial<Record<Input, InputCapability[]>>;

export type KeyBinding = {
  key: Input;
  bindTo: InputCapability;
};

// TODO: Optimization, missing types
export const getInputType = (input: Input): InputType => {
  if (input in MouseInput) return InputType.MOUSE_BUTTON;
  if (input in KeyboardInput) return InputType.KEYBOARD_KEY;

  return InputType.UNDEFINED;
};
