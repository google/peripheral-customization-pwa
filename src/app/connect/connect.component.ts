import { Component, OnInit } from '@angular/core';
import { ManagerService } from '../manager.service';

@Component({
  selector: 'app-connect',
  templateUrl: './connect.component.html',
  styleUrls: ['./connect.component.scss'],
})
export class ConnectComponent implements OnInit {
  // eslint-disable-next-line no-useless-constructor
  constructor(private managerService: ManagerService) {}

  ngOnInit(): void {
    // eslint-disable-next-line no-console
    this.managerService.reconnectToDevice().catch(e => console.warn(e));
  }

  connect(): void {
    // eslint-disable-next-line no-console
    this.managerService.connectToDevice().catch(e => console.error(e));
  }
}
