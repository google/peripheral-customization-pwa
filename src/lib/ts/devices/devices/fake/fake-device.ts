export const fakeDevice: HIDDevice = {
  vendorId: 0x000,
  productId: 0x0000,
  productName: 'Fake Mouse',
  opened: false,
  collections: [],

  open() {
    return new Promise<void>(resolve => {
      setTimeout(() => resolve(), 20);
    });
  },

  close() {
    return new Promise<void>(resolve => {
      setTimeout(() => resolve(), 20);
    });
  },

  forget() {
    return new Promise<void>(resolve => {
      setTimeout(() => resolve(), 20);
    });
  },

  sendReport(_reportId: number, _outputReport: Uint8Array): Promise<void> {
    return new Promise<void>(resolve => {
      setTimeout(() => resolve(), 20);
    });
  },

  sendFeatureReport(
    _reportId: number,
    _featureReport: Uint8Array,
  ): Promise<void> {
    return new Promise<void>(resolve => {
      setTimeout(() => resolve(), 20);
    });
  },

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  receiveFeatureReport(reportId: number): Promise<DataView> {
    const buffer = new Uint8Array([0xf0, 0x0f, 0xa5]);
    const data = new DataView(buffer);
    return Promise.resolve(data);
  },

  /* eslint-disable @typescript-eslint/no-empty-function */
  oninputreport() {},

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  addEventListener(type, listener, options = {}): void {},

  removeEventListener() {},

  dispatchEvent(_event: Event): boolean {
    return true;
  },
};
