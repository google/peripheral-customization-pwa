import { ConfiguratorEvents } from 'src/lib/ts/devices/configurator';

import { CurrentLevels } from 'src/lib/ts/devices/components/cpi';

import {
  getInputType,
  InputBindings,
} from 'src/lib/ts/devices/components/inputs';

import {
  CPI_COUNT,
  DEVICE_INPUTS,
  getInputFromType,
  defaultInputBindings,
  SUPPORTED_KEY_CODES,
} from './company-fake-mouse-constants';

import type FakeMouse from './company-fake-mouse';

// FW version
export const handleGetFirmware = (
  configurator: FakeMouse,
  buffer: Uint8Array,
): void => {
  // FIXME: stub
  const bufptr = buffer;
  bufptr[1] = 1;
  bufptr[2] = 2;
  bufptr[3] = 3;

  // Assuming version is "x.y.z" encoded in 3 bytes
  const firmwareVersion = new TextEncoder().encode(
    `${buffer[1]}.${buffer[2]}.${buffer[3]}.`,
  );
  configurator.emit(
    ConfiguratorEvents.RECEIVED_FIRMWARE_VERSION,
    firmwareVersion,
  );
};

// Battery Life
export const handleGetBattery = (
  configurator: FakeMouse,
  buffer: Uint8Array,
): void => {
  // FIXME: stub
  const bufptr = buffer;
  bufptr[1] = 42;
  // eslint-disable-next-line no-console
  console.warn('Fake mouse: query battery level handler');

  // Assuming level in percents
  const level = buffer[1];
  configurator.emit(ConfiguratorEvents.RECEIVED_BATTERY, level);
};

// Example of the handler for batch reply
// queried via CPI_LEVELS_GET
// received via sync hidDevice by pressing CPI button on mouse
export const handleGetCpiLevels = (
  configurator: FakeMouse,
  buffer: Uint8Array,
): void => {
  // returned active levels
  const cpiCurrent = buffer[1];
  const currentLevels: CurrentLevels = Array.from(
    { length: CPI_COUNT },
    (_, i) => i,
  ).reduce((acc, i) => {
    const offset = i + 2;
    const level = buffer[offset];
    return { ...acc, [i]: level };
  }, {});

  /* eslint-disable no-param-reassign */
  configurator.currentLevels = buffer.slice(2, 2 + CPI_COUNT);

  // eslint-disable-next-line no-console
  console.warn('Fake mouse handler: got CPI', cpiCurrent, currentLevels);

  configurator.emit(
    ConfiguratorEvents.RECEIVED_CPI_LEVELS,
    CPI_COUNT,
    cpiCurrent,
    currentLevels,
  );
};

// Set the single CPI level
export const handleSetCpiLevel = (
  configurator: FakeMouse,
  buffer: Uint8Array,
): void => {
  // eslint-disable-next-line no-console
  console.warn('Fake mouse handler: CPI set', buffer[1], buffer[2]);

  configurator.currentLevel = buffer[1];
  configurator.currentLevels[configurator.currentLevel] = buffer[2];

  configurator.emit(
    ConfiguratorEvents.CPI_WAS_SET,
    configurator.currentLevel,
    configurator.currentLevels[configurator.currentLevel],
  );
};

// Switched the current level
export const handleSwitchCpi = (
  configurator: FakeMouse,
  buffer: Uint8Array,
): void => {
  // eslint-disable-next-line no-console
  console.warn('Fake mouse handler: switched to CPI', buffer[1], buffer[2]);

  configurator.currentLevel = buffer[1];

  configurator.emit(
    ConfiguratorEvents.CHANGED_CURRENT_CPI,
    configurator.currentLevel,
  );
};

// Set the color for zone
export const handleSetLed = (
  configurator: FakeMouse,
  _buffer: Uint8Array,
): void => {
  // eslint-disable-next-line no-console
  console.warn('Fake mouse handler: set Led');
  configurator.emit(ConfiguratorEvents.LED_WAS_SET);
};

// Color for zone
export const handleGetLed = (
  configurator: FakeMouse,
  buffer: Uint8Array,
): void => {
  // eslint-disable-next-line no-console
  console.warn('Fake mouse handler: got Led', buffer);
  configurator.emit(ConfiguratorEvents.RECEIVED_LED, buffer.slice(2, 5));
};

// Receiving bindings from the mouse
export const handleGetInputBindings = (
  configurator: FakeMouse,
  buffer: Uint8Array,
): void => {
  const mouseMapping = DEVICE_INPUTS.reduce((acc, input, index) => {
    const offset = index * 2 + 1;

    const sourceKeyCode = SUPPORTED_KEY_CODES[input];
    if (sourceKeyCode === undefined) throw Error('Undefined source key');

    const targetKeyType = buffer[offset];
    const targetKeyCode = buffer[offset + 1];
    let targetKey;
    try {
      targetKey = getInputFromType(targetKeyType, targetKeyCode);
    } catch (error) {
      const defaultInputType = defaultInputBindings[input];
      if (!defaultInputType) throw error;
      targetKey = defaultInputType.key;
    }

    acc[input] = {
      key: input,
      bindTo: {
        key: targetKey,
        type: getInputType(targetKey),
      },
    };
    return acc;
  }, {} as InputBindings);

  // eslint-disable-next-line no-console
  console.warn('Fake mouse handler: got bindings', mouseMapping);

  // eslint-disable-next-line no-param-reassign
  configurator.mouseMapping = mouseMapping;
  configurator.emit(ConfiguratorEvents.RECEIVED_INPUT_BINDINGS, mouseMapping);
};

// Bindings was set
export const handleSetInputBindings = (
  configurator: FakeMouse,
  _buffer: Uint8Array,
): void => {
  // eslint-disable-next-line no-console
  console.warn('Fake mouse handler: set bindings');
  configurator.emit(ConfiguratorEvents.BUTTON_WAS_SET);
};
