import { Component } from '@angular/core';
import { AssetsService } from 'src/app/assets.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})
export class FooterComponent {
  imgSource = this.assetsService.getDeviceLogo();

  // eslint-disable-next-line no-useless-constructor
  constructor(private assetsService: AssetsService) {}
}
