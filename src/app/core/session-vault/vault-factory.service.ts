import { Injectable } from '@angular/core';
import { BrowserVault, IdentityVaultConfig, Vault } from '@ionic-enterprise/identity-vault';
import { Platform } from '@ionic/angular';

@Injectable({
  providedIn: 'root',
})
export class VaultFactoryService {
  constructor(private platform: Platform) {}

  create(config: IdentityVaultConfig): Vault | BrowserVault {
    return this.platform.is('hybrid') ? new Vault(config) : new BrowserVault(config);
  }
}
