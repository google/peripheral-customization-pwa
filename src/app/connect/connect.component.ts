import { Component } from '@angular/core';
import { ManagerService } from '../manager.service';

@Component({
  selector: 'app-connect',
  templateUrl: './connect.component.html',
  styleUrls: ['./connect.component.scss'],
})
export class ConnectComponent {
  // eslint-disable-next-line no-useless-constructor
  constructor(private managerService: ManagerService) {}

  connect(): void {
    // eslint-disable-next-line no-console
    this.managerService.connectToDevice().catch(e => console.error(e));
  }
}
