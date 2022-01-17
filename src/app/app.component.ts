import { Component, OnInit } from '@angular/core';
import { Platform } from '@ionic/angular';
import { ApplicationService } from './core';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
  constructor(private application: ApplicationService, private platform: Platform) {}

  ngOnInit() {
    if (!this.platform.is('hybrid')) {
      this.application.registerForUpdates();
    }
  }
}
