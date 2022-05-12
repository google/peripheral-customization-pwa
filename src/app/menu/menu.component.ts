import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NavLink } from '../model/nav-link';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent {
  navLinks: Array<NavLink>;

  constructor(private router: Router) {
    this.navLinks = [
      {
        label: 'Set RGB Lighting',
        link: './rgb',
      },
      {
        label: 'Customize buttons',
        link: './buttons',
      },
      {
        label: 'Adjust DPI',
        link: './dpi',
      },
    ];
  }
}
