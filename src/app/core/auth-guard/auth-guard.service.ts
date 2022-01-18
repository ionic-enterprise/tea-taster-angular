import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { NavController } from '@ionic/angular';

import { AuthenticationService } from '../authentication/authentication.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuardService implements CanActivate {
  constructor(private authentication: AuthenticationService, private navCtrl: NavController) {}

  async canActivate(): Promise<boolean> {
    const authed = await this.authentication.isAuthenticated();
    if (authed) {
      return true;
    } else {
      this.navCtrl.navigateRoot('/login');
      return false;
    }
  }
}
