export interface Assets {
  deviceName: string;
  logoUri: string;
  deviceTopImgUri: string;
  deviceBottomImgUri: string;
}
export type AssetsById = Record<string, Record<string, Assets>>;

const assetsById: AssetsById = {
  // Fake device for demo purposes only
  // FIXME: remove the demo device!
  0x0000: {
    0x0000: {
      deviceName: 'Fake demo mouse',
      logoUri: 'assets/images/fake/footer-logo.png',
      deviceTopImgUri: 'assets/images/fake/mouse_top.svg',
      deviceBottomImgUri: 'assets/images/fake/mouse_bottom.svg',
    },
  },
  0x0001: {
    0x2003: {
      deviceName: 'Model11 Wireless (BlueTooth)',
      logoUri: 'assets/images/vendor1/footer-logo.svg',
      deviceTopImgUri: 'assets/images/vendor1/model11wireless_top.png',
      deviceBottomImgUri: 'assets/images/vendor1/model11wireless_bottom.png',
    },
  },
  0x0002: {
    0x1824: {
      // Old FWres
      deviceName: 'Model12',
      logoUri: 'assets/images/vendor1/footer-logo.svg',
      deviceTopImgUri: 'assets/images/vendor1/model12wired_top.png',
      deviceBottomImgUri: 'assets/images/vendor1/model12wired_bottom.png',
    },
    0x184c: {
      // New FWres
      deviceName: 'Model12',
      logoUri: 'assets/images/vendor1/footer-logo.svg',
      deviceTopImgUri: 'assets/images/vendor1/model12wired_top.png',
      deviceBottomImgUri: 'assets/images/vendor1/model12wired_bottom.png',
    },
    0x1830: {
      deviceName: 'Model12 Wireless',
      logoUri: 'assets/images/vendor1/footer-logo.svg',
      deviceTopImgUri: 'assets/images/vendor1/model12wireless_top.png',
      deviceBottomImgUri: 'assets/images/vendor1/model12wireless_bottom.png',
    },
    0x2001: {
      deviceName: 'Model11',
      logoUri: 'assets/images/vendor1/footer-logo.svg',
      deviceTopImgUri: 'assets/images/vendor1/model11wired_top.png',
      deviceBottomImgUri: 'assets/images/vendor1/model11wired_bottom.png',
    },
    0x2002: {
      deviceName: 'Model11 Wireless via dongle',
      logoUri: 'assets/images/vendor1/footer-logo.svg',
      deviceTopImgUri: 'assets/images/vendor1/model11wireless_top.png',
      deviceBottomImgUri: 'assets/images/vendor1/model11wireless_bottom.png',
    },
    0x2003: {
      deviceName: 'Model11 Wireless',
      logoUri: 'assets/images/vendor1/footer-logo.svg',
      deviceTopImgUri: 'assets/images/vendor1/model11wireless_top.png',
      deviceBottomImgUri: 'assets/images/vendor1/model11wireless_bottom.png',
    },
  },
  0x0003: {
    0x3001: {
      deviceName: 'Model21 RGB',
      logoUri: 'assets/images/vendor2/vendor2.jpeg',
      deviceTopImgUri: 'assets/images/vendor2/model21_top.png',
      deviceBottomImgUri: 'assets/images/vendor2/model21_bottom.png',
    },
  },
};

export default assetsById;
