import { Injectable } from '@angular/core';
import { IonicAuth } from '@ionic-enterprise/auth';
import { Platform } from '@ionic/angular';

import { mobileAuthConfig, webAuthConfig } from '@env/environment';
import { User } from '@app/models';
import { SessionVaultService } from '../session-vault/session-vault.service';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService extends IonicAuth {
  private vaultService: SessionVaultService;

  // @ts-ignore
  constructor(vaultService: SessionVaultService, platform: Platform) {
    const isCordovaApp = platform.is('cordova');
    const config = isCordovaApp ? mobileAuthConfig : webAuthConfig;
    config.tokenStorageProvider = vaultService.vault;
    super(config);
    this.vaultService = vaultService;
  }

  async login(): Promise<void> {
    try {
      await super.login();
    } catch (err) {
      // This is to handle the password reset case for Azure AD
      //  This only applicable to Azure AD.
      console.log('login error:', +err);
      const message: string = err.message;
      // This is the error code returned by the Azure AD servers on failure.
      if (message !== undefined && message.startsWith('AADB2C90118')) {
        // The address you pass back is the custom user flow (policy) endpoint
        await super.login(
          'https://vikingsquad.b2clogin.com/vikingsquad.onmicrosoft.com/v2.0/.well-known/openid-configuration?p=B2C_1_password_reset'
        );
      } else {
        throw new Error(err.error);
      }
    }
  }

  async onLogout(): Promise<void> {
    await this.vaultService.clearSession();
  }

  async getUserInfo(): Promise<User | undefined> {
    const idToken = await this.getIdToken();
    if (!idToken) {
      return;
    }

    let email = idToken.email;
    if (idToken.emails instanceof Array) {
      email = idToken.emails[0];
    }

    return {
      id: idToken.sub,
      email,
      firstName: idToken.firstName,
      lastName: idToken.lastName,
    };
  }
}
