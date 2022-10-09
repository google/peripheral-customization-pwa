import {
  LEDCapabilities,
  LEDColorRange,
} from 'src/lib/ts/devices/components/led';

import { CPILevels } from 'src/lib/ts/devices/components/cpi';

import {
  KeyboardInput,
  MediaInput,
  MouseInput,
  CpiChangeInput,
  Input,
  InputType,
  InputMap,
  InputBindings,
} from 'src/lib/ts/devices/components/inputs';

// Assuming the opcode is the byte 0 in each data packet
export enum OPCODE {
  NOOP = 0x00,
  FIRMWARE_GET = 0x01,
  BATTERY_GET = 0x02,
  BATTERY_CHANGED = 0x03, // emitted by mouse without the request
  LED_SET = 0x11,
  LED_GET = 0x12,
  CPI_LEVEL_SET = 0x21, // Set the single sensitivity level
  CPI_LEVELS_GET = 0x22, // Request all sensitivity levels
  CPI_CURRENT_SET = 0x23, // Switch the current level
  INPUT_BINDINGS_SET = 0x31,
  INPUT_BINDINGS_GET = 0x32,
}

/* Define LED zones
 * see lib/ts/devices/components/led.ts
 * Here only 2 zones defined: SCROLL and LOGO
 */
export const LED_CAPABILITIES: LEDCapabilities = {
  ALL: LEDColorRange.ALL_COLORS,
  SCROLL: LEDColorRange.ALL_COLORS,
  LOGO: LEDColorRange.ALL_COLORS,
};

// Predefined levels quantity
export const CPI_COUNT = 3;

// Example: mapping IDs in protocol to CPI levels
export const CpiLevels: CPILevels = {
  0x10: 200,
  0x20: 500,
  0x30: 800,
  0x40: 1100,
  0x50: 1400,
  0x60: 1700,
  0x70: 2000,
  0x80: 2300,
  0x90: 2600,
  0xa0: 2900,
  0xb0: 3200,
  0xc0: 3500,
  0xd0: 3800,
  0xe0: 4100,
  0xf0: 4400,
} as const;

/* INPUT
 * Assuming the fake mouse is able to map onto physical buttons:
 * - mouse input
 * - CPI switch button
 * - keyboard input
 * - multimedia input
 *
 * Let's assume each button is encoding by octets pair:
 * - InputType group code
 * - Key code from the corresponding InputType group
 */

// Listed buttons physically available on mouse
export const DEVICE_INPUTS: MouseInput[] = [
  MouseInput.LEFT,
  MouseInput.RIGHT,
  MouseInput.MIDDLE,
  MouseInput.TOP,
  MouseInput.WHEEL_UP,
  MouseInput.WHEEL_DOWN,
];

// Key functions mappings
export const InputTypeMap: Partial<Record<InputType, number>> = {
  UNDEFINED: 0x00, // UNBOUND
  MOUSE_BUTTON: 0x10,
  CPI_CHANGE: 0x20,
  KEYBOARD: 0x10,
  MEDIA: 0x20,
} as const;

// Mouse buttons codes
export const mouseKeyCodesMap: Partial<Record<MouseInput, number>> = {
  [MouseInput.LEFT]: 0x01,
  [MouseInput.RIGHT]: 0x02,
  [MouseInput.MIDDLE]: 0x03,
  [MouseInput.WHEEL_UP]: 0x04,
  [MouseInput.WHEEL_DOWN]: 0x05,
  [MouseInput.LEFT_BACK]: 0x06,
  [MouseInput.LEFT_FRONT]: 0x07,
  [MouseInput.RIGHT_BACK]: 0x08,
  [MouseInput.RIGHT_FRONT]: 0x09,
  [MouseInput.TOP]: 0x0a,
  [MouseInput.DOUBLE_CLICK_LEFT]: 0x0b,
} as const;

// Emulated only several keyboard keys mapping, just as example
// Check the full list in KeyboardInput
export const keyboardKeyCodesMap: Partial<Record<KeyboardInput, number>> = {
  [KeyboardInput.NONE]: 0x00,
  [KeyboardInput.DIGIT_1]: 0x01,
  [KeyboardInput.DIGIT_2]: 0x02,
  [KeyboardInput.DIGIT_3]: 0x03,
  [KeyboardInput.DIGIT_4]: 0x04,
  [KeyboardInput.DIGIT_5]: 0x05,
  [KeyboardInput.DIGIT_6]: 0x06,
  [KeyboardInput.DIGIT_7]: 0x07,
  [KeyboardInput.DIGIT_8]: 0x08,
  [KeyboardInput.DIGIT_9]: 0x09,
  [KeyboardInput.DIGIT_0]: 0x0a,
  [KeyboardInput.ENTER]: 0x10,
  [KeyboardInput.ESCAPE]: 0x11,
  [KeyboardInput.BACKSPACE]: 0x12,
  [KeyboardInput.TAB]: 0x13,
  [KeyboardInput.F1]: 0x21,
  [KeyboardInput.F2]: 0x22,
  [KeyboardInput.F3]: 0x23,
  [KeyboardInput.F4]: 0x24,
  [KeyboardInput.F5]: 0x25,
  [KeyboardInput.F6]: 0x26,
  [KeyboardInput.F7]: 0x27,
  [KeyboardInput.F8]: 0x28,
  [KeyboardInput.F9]: 0x29,
  [KeyboardInput.F10]: 0x2a,
  [KeyboardInput.F11]: 0x2b,
  [KeyboardInput.F12]: 0x2c,
} as const;

// Some Media management keys mappings
export const mediaKeyCodesMap: Partial<Record<MediaInput, number>> = {
  [MediaInput.KEY_MEDIA_PLAYPAUSE]: 0xa1, //
  [MediaInput.KEY_MEDIA_STOP]: 0xa2, //
  [MediaInput.KEY_MEDIA_PREVIOUSSONG]: 0xa3, //
  [MediaInput.KEY_MEDIA_NEXTSONG]: 0xa4, //
  [MediaInput.KEY_MEDIA_MUTE]: 0xa5, //
  [MediaInput.KEY_MEDIA_VOLUMEUP]: 0xa6, //
  [MediaInput.KEY_MEDIA_VOLUMEDOWN]: 0xa7, //
  [MediaInput.KEY_MEDIA_HOME]: 0xb0, //
  [MediaInput.KEY_MEDIA_BACK]: 0xb1, //
  [MediaInput.KEY_MEDIA_FORWARD]: 0xb2, //
  [MediaInput.KEY_MEDIA_FIND]: 0xb3, //
  [MediaInput.KEY_MEDIA_SCROLLUP]: 0xb4, //
  [MediaInput.KEY_MEDIA_SCROLLDOWN]: 0xb5, //
  [MediaInput.KEY_MEDIA_SLEEP]: 0xc0, //
  [MediaInput.KEY_MEDIA_REFRESH]: 0xc1, //
  [MediaInput.KEY_MEDIA_CALC]: 0xc2, //
} as const;

// Allow to map CPI switch
export const cpiKeyCodesMap: Partial<Record<CpiChangeInput, number>> = {
  [CpiChangeInput.CYCLE_CPI]: 0x01,
};

// Reversed mappings
export const reversedMouseKeyCodesMap: Record<number, MouseInput> =
  Object.entries(mouseKeyCodesMap).reduce(
    (acc, entry) => ({ ...acc, [entry[1]]: entry[0] }),
    {},
  );

export const reversedKeyboardKeyCodesMap: Record<number, KeyboardInput> =
  Object.entries(keyboardKeyCodesMap).reduce(
    (acc, entry) => ({ ...acc, [entry[1]]: entry[0] }),
    {},
  );

export const reversedMediaKeyCodesMap: Record<number, MediaInput> =
  Object.entries(mediaKeyCodesMap).reduce(
    (acc, entry) => ({ ...acc, [entry[1]]: entry[0] }),
    {},
  );

export const reversedCpiKeyCodesMap: Record<number, CpiChangeInput> =
  Object.entries(cpiKeyCodesMap).reduce(
    (acc, entry) => ({ ...acc, [entry[1]]: entry[0] }),
    {},
  );

export const getInputFromType = (type: number, key: number): Input => {
  if (reversedMouseKeyCodesMap[type]) {
    return reversedMouseKeyCodesMap[type];
  }

  if (type === InputTypeMap.KEYBOARD && reversedKeyboardKeyCodesMap[key]) {
    return reversedKeyboardKeyCodesMap[key];
  }

  if (type === InputTypeMap.MEDIA && reversedMediaKeyCodesMap[key]) {
    return reversedMediaKeyCodesMap[key];
  }

  if (reversedCpiKeyCodesMap[type]) {
    return reversedCpiKeyCodesMap[type];
  }

  throw Error('Input not found');
};

// Keys groups supported by mouse
export const SUPPORTED_KEY_CODES: InputMap = {
  ...mediaKeyCodesMap,
  ...keyboardKeyCodesMap,
  ...mouseKeyCodesMap,
  ...cpiKeyCodesMap,
};

// Default settings
export const defaultInputBindings: InputBindings = {
  LEFT: {
    key: MouseInput.LEFT,
    bindTo: { key: MouseInput.LEFT, type: InputType.MOUSE_BUTTON },
  },
  RIGHT: {
    key: MouseInput.RIGHT,
    bindTo: { key: MouseInput.RIGHT, type: InputType.MOUSE_BUTTON },
  },
  MIDDLE: {
    key: MouseInput.MIDDLE,
    bindTo: { key: MouseInput.MIDDLE, type: InputType.MOUSE_BUTTON },
  },
  TOP: {
    key: CpiChangeInput.CYCLE_CPI,
    bindTo: { key: CpiChangeInput.CYCLE_CPI, type: InputType.CPI_CHANGE },
  },
  WHEEL_UP: {
    key: MouseInput.WHEEL_UP,
    bindTo: { key: MouseInput.WHEEL_UP, type: InputType.MOUSE_BUTTON },
  },
  WHEEL_DOWN: {
    key: MouseInput.WHEEL_DOWN,
    bindTo: { key: MouseInput.WHEEL_DOWN, type: InputType.MOUSE_BUTTON },
  },
};
