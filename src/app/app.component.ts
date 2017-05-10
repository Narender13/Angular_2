
import { Component, HostListener, OnInit, ViewEncapsulation } from '@angular/core';

import { ConfigurationService } from './common/configuration.service';

@Component({
  selector: 'app',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./app.style.css'],
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {

  activeMenuId: string;

  mobileMenuActive: boolean = false;
  mainMenuOpen: boolean = true;

  isDevelopmentMode: boolean = false;

  constructor() {

    console.log('run mode:' + process.env.ENV);

    if (process.env.ENV === 'development') {
      this.isDevelopmentMode = true;
    }
  }

  toggleMenu(e) {

    if (window.innerWidth < 961) {
      this.mobileMenuActive = !this.mobileMenuActive;
    } else {
      this.mainMenuOpen = !this.mainMenuOpen;
      if (this.mainMenuOpen === true) {
        document.getElementById('MENUSIDE').style.width = '193px';
        document.getElementById('CONTENTSIDE').style.marginLeft = '193px';
      } else {
        document.getElementById('MENUSIDE').style.width = '0';
        document.getElementById('CONTENTSIDE').style.marginLeft = '0';
      }
    }

    e.preventDefault();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {

    if ( this.isDevelopmentMode ) {

      if (window.innerWidth < 961) {
        this.mobileMenuActive = false;
        document.getElementById('MENUSIDE').style.width = '100%';
        document.getElementById('CONTENTSIDE').style.marginLeft = '0';
      } else {
        document.getElementById('MENUSIDE').style.width = '193px';
        document.getElementById('CONTENTSIDE').style.marginLeft = '193px';
      }
    } else {
      document.getElementById('CONTENTSIDE').style.marginLeft = '0';
    }
  }

  ngOnInit() {
    ConfigurationService.initialize();
  }

}

/*
 * Please review the https://github.com/AngularClass/angular2-examples/ repo for
 * more angular app examples that you may copy/paste
 * (The examples may not be updated as quickly. Please open an issue on github for us to update it)
 * For help or questions please contact us at @AngularClass on twitter
 * or our chat on Slack at https://AngularClass.com/slack-join
 */
