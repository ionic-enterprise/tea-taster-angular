import { Component, OnInit } from '@angular/core';
import { SessionVaultService } from '@app/core';
import { NavController, Platform } from '@ionic/angular';

@Component({
  selector: 'app-start',
  templateUrl: './start.page.html',
  styleUrls: ['./start.page.scss'],
})
export class StartPage implements OnInit {
  constructor(private navController: NavController, private platform: Platform, private session: SessionVaultService) {}

  async ngOnInit() {
    if (this.platform.is('hybrid') && (await this.session.canUnlock())) {
      this.navController.navigateRoot('/login');
    } else {
      this.navController.navigateRoot('/tabs/tea');
    }
  }
}
