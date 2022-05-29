export interface Assets {
  deviceName: string;
  logoUri: string;
  deviceTopImgUri: string;
  deviceBottomImgUri: string;
}
export type AssetsById = Record<string, Record<string, Assets>>;

const assetsById: AssetsById = {
  '0002': {
    '2001': {
      deviceName: 'Model11',
      logoUri: 'assets/images/vendor1/footer-logo.svg',
      deviceTopImgUri: 'assets/images/vendor1/model11_top.png',
      deviceBottomImgUri: 'assets/images/vendor1/model11_bottom.png',
    },
    '2003': {
      deviceName: 'Model11 Wireless',
      logoUri: 'assets/images/vendor1/footer-logo.svg',
      deviceTopImgUri: 'assets/images/vendor1/model11_top.png',
      deviceBottomImgUri: 'assets/images/vendor1/model11_bottom.png',
    },
  },
  '0003': {
    '3001': {
      deviceName: 'Model21 RGB',
      logoUri: 'assets/images/vendor2/vendor2.jpeg',
      deviceTopImgUri: 'assets/images/vendor1/model11_top.png',
      deviceBottomImgUri: 'assets/images/vendor1/model11_bottom.png',
    },
  },
};

export default assetsById;
