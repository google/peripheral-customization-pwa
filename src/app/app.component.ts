import { Component, OnDestroy, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Subscription } from 'rxjs';

import { ManagerService } from './manager.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  device$ = this.managerService.device$;

  deviceSubscription!: Subscription;

  // eslint-disable-next-line no-useless-constructor
  constructor(
    private titleService: Title,
    private managerService: ManagerService,
  ) {}

  ngOnInit(): void {
    this.deviceSubscription = this.device$.subscribe({
      next: device =>
        this.titleService.setTitle(
          device?.hidDevice.productName ?? 'Connect to device',
        ),
      // eslint-disable-next-line no-console
      error: e => console.error(e),
    });

    navigator.hid.addEventListener('connect', _event => {
      // Refresh the whole app on connect
      window.location.reload();
    });

    navigator.hid.addEventListener('disconnect', _event => {
      // Refresh the whole app on disconnect
      window.location.reload();
    });
  }

  ngOnDestroy(): void {
    this.deviceSubscription.unsubscribe();
  }
}
