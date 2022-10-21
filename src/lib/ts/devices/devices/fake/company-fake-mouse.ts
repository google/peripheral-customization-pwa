import { createUInt8Array } from 'src/lib/ts/devices/util';

import {
  Input,
  KeyBinding,
  MouseInput,
  InputBindings,
  InputCapabilities,
  getInputType,
} from 'src/lib/ts/devices/components/inputs';

import {
  Color,
  LEDCapabilities,
  LEDZones,
  colorToArray,
} from 'src/lib/ts/devices/components/led';

import { CPICapabilities } from 'src/lib/ts/devices/components/cpi';

import {
  DeviceFilter,
  HIDDeviceConfigurator,
} from 'src/lib/ts/devices/configurator';

import {
  OPCODE,
  CPI_COUNT,
  CpiLevels,
  LED_CAPABILITIES,
  SUPPORTED_KEY_CODES,
  DEVICE_INPUTS,
  InputTypeMap,
  defaultInputBindings,
} from './company-fake-mouse-constants';

import {
  handleGetFirmware,
  handleGetBattery,
  handleSetCpiLevel,
  handleGetCpiLevels,
  handleSwitchCpi,
  handleSetLed,
  handleGetLed,
  handleSetInputBindings,
  handleGetInputBindings,
} from './company-fake-mouse-handlers';

export type ButtonsCapabilities = Partial<Record<MouseInput, Input>>;

const zoneToBinary: Partial<Record<LEDZones, number>> = {
  [LEDZones.ALL]: 0,
  [LEDZones.SCROLL]: 1,
  [LEDZones.LOGO]: 2,
};

const HANDLERS_MAP: Record<
  number,
  // eslint-disable-next-line no-use-before-define
  (configurator: FakeMouse, buffer: Uint8Array) => void
> = {
  [OPCODE.FIRMWARE_GET]: handleGetFirmware,
  [OPCODE.BATTERY_GET]: handleGetBattery,
  [OPCODE.BATTERY_CHANGED]: handleGetBattery,
  [OPCODE.CPI_LEVEL_SET]: handleSetCpiLevel,
  [OPCODE.CPI_LEVELS_GET]: handleGetCpiLevels,
  [OPCODE.CPI_CURRENT_SET]: handleSwitchCpi,
  [OPCODE.LED_SET]: handleSetLed,
  [OPCODE.LED_GET]: handleGetLed,
  [OPCODE.INPUT_BINDINGS_SET]: handleSetInputBindings,
  [OPCODE.INPUT_BINDINGS_GET]: handleGetInputBindings,
};

export default class FakeMouse extends HIDDeviceConfigurator {
  static readonly FILTER: DeviceFilter = {
    vendorId: 0x0000,
    productId: 0x0000,
  };

  // Predefined report data size
  // Could be read from the collection
  static readonly REPORT_LENGTH = 64;

  // Map codes to CPI levels
  static readonly CPI_LEVELS = CpiLevels;

  // Required
  hidDevice: HIDDevice;

  // Required
  defaultInputBindings = defaultInputBindings;

  // Report ID used for communicating with the device
  reportId?: number;

  // Used to indicate what the operation requested.
  // Due to async nature of the framework we need to
  // know what answer we are expecting in case if
  // the reply doesn't contain the opcode.
  // Not needed if the operation code exists in every reply.
  eventId = OPCODE.NOOP;

  // just a runtime placeholder for CPI levels used
  currentLevel: number;

  currentLevels: Uint8Array;

  mouseMapping: InputBindings = {};

  constructor(devices: HIDDevice[]) {
    super();

    this.currentLevel = 0;
    this.currentLevels = createUInt8Array({
      data: [0x20, 0x40, 0xb0],
      size: CPI_COUNT,
    });

    /** FIXME: code example for the device detection
    *          read reportId from the collection!
    const hidDevice = devices.find(
      device => device.collections[0]?.usagePage === 0xFF00,
    );
    if (!hidDevice) throw Error("Device ID wasn't detected");

    this.hidDevice = hidDevice;
    */

    this.hidDevice = devices[0];
    this.reportId = 5;
  }

  // Optional: not needed as a rule
  override open(): Promise<void> {
    return super.open();
  }

  // Optional: not needed as a rule
  override close(): Promise<void> {
    return super.close();
  }

  // Optional: not needed as a rule
  override sendReport(
    reportId: number,
    outputReport: Uint8Array,
  ): Promise<void> {
    // eslint-disable-next-line no-console
    console.warn('Fake mouse: sending', this.eventId);

    // FIXME: stub
    // Emulate the received reply from the device
    // normally consumed in handleInputReport()
    const handler = HANDLERS_MAP[this.eventId];
    this.eventId = OPCODE.NOOP;
    if (handler !== undefined) handler(this, outputReport);

    // Send the report
    return super.sendReport(reportId, outputReport);
  }

  // Set the input handler
  // Catch any Reports here
  override handleInputReport(e: HIDInputReportEvent): void {
    // Example for handling the communication protocol relying to
    // the data structure from the report, the command OPCODE for instance.
    // eslint-disable-next-line no-console
    console.warn('Fake mouse handleInputReport:', e);
    const { data, reportId } = e;
    const buffer = new Uint8Array(data.buffer);
    const reportCode = buffer[0];
    const handler = HANDLERS_MAP[reportCode];

    if (reportId !== this.reportId) throw Error('*** Unknown report received:');

    if (!handler)
      throw Error(`*** Unknown report received: 0x ${buffer[0].toString(16)}`);

    handler(this, buffer);
  }

  // Basics

  // Mandatory
  override requestFirmwareVersion(): Promise<void> {
    const outputReport = createUInt8Array({
      data: [OPCODE.FIRMWARE_GET, 0x00],
      size: FakeMouse.REPORT_LENGTH,
    });

    // eslint-disable-next-line no-console
    console.warn('Fake mouse: request FW version');
    this.eventId = OPCODE.FIRMWARE_GET;

    return this.reportId !== undefined
      ? this.sendReport(this.reportId, outputReport)
      : Promise.reject();
  }

  // Mandatory
  // For wired mouse just return promise
  override requestBatteryLife(): Promise<void> {
    const outputReport = createUInt8Array({
      data: [OPCODE.BATTERY_GET, 0x00],
      size: FakeMouse.REPORT_LENGTH,
    });

    // eslint-disable-next-line no-console
    console.warn('Fake mouse: query battery level');
    this.eventId = OPCODE.BATTERY_GET;

    return this.reportId !== undefined
      ? this.sendReport(this.reportId, outputReport)
      : Promise.reject();
  }

  // CPI
  // define mouse sensitivity levels
  override cpiCapabilities(): CPICapabilities {
    const capabilities: CPICapabilities = {
      count: CPI_COUNT,
      levels: FakeMouse.CPI_LEVELS,
    };

    return capabilities;
  }

  // Batch query of the sensitivity levels from the mouse
  override requestCpiLevels(): Promise<void> {
    // FIXME: added levels here to simplify emulation
    const outputReport = createUInt8Array({
      data: [OPCODE.CPI_LEVELS_GET, this.currentLevel, ...this.currentLevels],
      size: FakeMouse.REPORT_LENGTH,
    });

    // eslint-disable-next-line no-console
    console.warn('Mouse: query CPI levels');
    this.eventId = OPCODE.CPI_LEVELS_GET;

    return this.reportId !== undefined
      ? this.sendReport(this.reportId, outputReport)
      : Promise.reject();
  }

  // Set the single sensitivity level
  override setCpiLevel(index: number, level: number): Promise<void> {
    const lvl = level === undefined ? level : this.currentLevels[index];
    const outputReport = createUInt8Array({
      data: [OPCODE.CPI_LEVEL_SET, index, lvl],
      size: FakeMouse.REPORT_LENGTH,
    });

    // eslint-disable-next-line no-console
    console.warn('Fake mouse: set CPI level:', index, lvl);
    this.eventId = OPCODE.CPI_LEVEL_SET;

    return this.reportId !== undefined
      ? this.sendReport(this.reportId, outputReport)
      : Promise.reject();
  }

  // Switch the current sensitivity level to another one
  override changeCurrentCpi(toIndex: number, withValue: number): Promise<void> {
    const outputReport = createUInt8Array({
      data: [OPCODE.CPI_CURRENT_SET, toIndex, withValue],
      size: FakeMouse.REPORT_LENGTH,
    });

    // eslint-disable-next-line no-console
    console.warn('Fake mouse: switch CPI:', toIndex, withValue);
    this.eventId = OPCODE.CPI_CURRENT_SET;

    return this.reportId !== undefined
      ? this.sendReport(this.reportId, outputReport)
      : Promise.reject();
  }

  // RGB
  override ledCapabilities(): LEDCapabilities {
    return LED_CAPABILITIES;
  }

  override setLed(color: Color, zone: LEDZones): Promise<void> {
    const zoneInBinary = zoneToBinary[zone];

    if (zoneInBinary === undefined) throw Error('Undefined zone');

    const outputReport = createUInt8Array({
      data: [
        OPCODE.LED_SET,
        zoneInBinary,
        ...colorToArray(color), // color zone
      ],
      size: FakeMouse.REPORT_LENGTH,
    });

    // eslint-disable-next-line no-console
    console.warn('Fake mouse: setLed', color, zone, zoneInBinary);
    this.eventId = OPCODE.LED_SET;

    return this.reportId !== undefined
      ? this.sendReport(this.reportId, outputReport)
      : Promise.reject();
  }

  // Inputs
  override inputCapabilities(): InputCapabilities {
    // Any mouse button can return any of the supported key codes
    const capabilities = DEVICE_INPUTS.reduce((acc, button) => {
      const buttonCapability = Object.entries(SUPPORTED_KEY_CODES).map(
        element => {
          const input = element[0] as Input;

          return {
            key: input,
            type: getInputType(input),
          };
        },
      );

      return {
        ...acc,
        [button]: buttonCapability,
      };
    }, {} as InputCapabilities);

    return capabilities;
  }

  // Query the current bindings from the mouse
  override requestInputBindings(): Promise<void> {
    const outputReport = createUInt8Array({
      data: [OPCODE.INPUT_BINDINGS_GET, 0x00],
      size: FakeMouse.REPORT_LENGTH,
    });

    // eslint-disable-next-line no-console
    console.warn('Fake mouse: query keys bindings');

    this.eventId = OPCODE.INPUT_BINDINGS_GET;

    return this.reportId !== undefined
      ? this.sendReport(this.reportId, outputReport)
      : Promise.reject();
  }

  // Set the
  override setInput(keyBinding: KeyBinding): Promise<void> {
    const data = [OPCODE.INPUT_BINDINGS_SET];

    // eslint-disable-next-line no-console
    console.warn('Fake mouse: set bindings for the key');

    DEVICE_INPUTS.forEach((button, index) => {
      const offset = index * 2 + 1;

      const inputBinding = this.mouseMapping[button];
      if (!inputBinding) throw Error(`input binding is undefined to ${button}`);

      const inputTarget =
        inputBinding.key === keyBinding.key
          ? keyBinding.bindTo
          : inputBinding.bindTo;

      const inputTargetCode = SUPPORTED_KEY_CODES[inputTarget.key];

      const inputTargetType = InputTypeMap[inputTarget.type];

      if (inputTargetCode === undefined) throw Error('Unknown input code');
      if (inputTargetType === undefined) throw Error('Unknown input type');

      data[offset] = inputTargetType;
      data[offset + 1] = inputTargetCode;
    });

    const outputReport = createUInt8Array({
      data,
      size: FakeMouse.REPORT_LENGTH,
    });

    // Doesn't return the reply
    this.eventId = OPCODE.INPUT_BINDINGS_SET;

    return this.reportId !== undefined
      ? this.sendReport(this.reportId, outputReport)
      : Promise.reject();
  }
}
