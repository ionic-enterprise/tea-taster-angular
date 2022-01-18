import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { Session } from '@app/models';
import { selectAuthToken } from '@app/store';
import { NavController } from '@ionic/angular';
import { Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { map, mergeMap, take, tap } from 'rxjs/operators';
import { SessionVaultService } from '../session-vault/session-vault.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuardService implements CanActivate {
  constructor(private navController: NavController, private sessionVault: SessionVaultService, private store: Store) {}

  canActivate(): Observable<boolean> {
    return this.store.select(selectAuthToken).pipe(
      take(1),
      mergeMap((token) => (token ? of(token) : this.tryRestoreSession())),
      // eslint-disable-next-line ngrx/avoid-mapping-selectors
      map((value) => !!value),
      tap((sessionExists) => {
        if (!sessionExists) {
          this.navController.navigateRoot(['/', 'login']);
        }
      })
    );
  }

  private async tryRestoreSession(): Promise<Session | undefined> {
    try {
      return await this.sessionVault.restoreSession();
    } catch (err) {
      return undefined;
    }
  }
}
