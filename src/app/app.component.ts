import { Component, OnInit } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Store } from '@ngrx/store';
import { SessionVaultService } from './core';
import { startup } from './store/actions';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
  constructor(private platform: Platform, private session: SessionVaultService, private store: Store) {}

  async ngOnInit() {
    if (!(this.platform.is('hybrid') && (await this.session.canUnlock()))) {
      this.store.dispatch(startup());
    }
  }
}
