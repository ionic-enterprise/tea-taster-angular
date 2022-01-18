import { Injectable } from '@angular/core';
import { NavController } from '@ionic/angular';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { from, of } from 'rxjs';
import { catchError, exhaustMap, map, mergeMap, tap } from 'rxjs/operators';
import { AuthMode } from '@ionic-enterprise/identity-vault';

import {
  login,
  loginFailure,
  loginSuccess,
  logout,
  logoutFailure,
  logoutSuccess,
  sessionLocked,
  unauthError,
  unlockSession,
  unlockSessionFailure,
  unlockSessionSuccess,
} from '@app/store/actions';
import { AuthenticationService, SessionVaultService, UnlockMode } from '@app/core';

@Injectable()
export class AuthEffects {
  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(login),
      exhaustMap((action) =>
        from(this.performLogin(action.mode)).pipe(
          mergeMap(() => this.auth.getUserInfo()),
          map((user) => loginSuccess({ user })),
          catchError(() => of(loginFailure({ errorMessage: 'Unknown error in login' })))
        )
      )
    )
  );

  unlockSession$ = createEffect(() =>
    this.actions$.pipe(
      ofType(unlockSession),
      exhaustMap(() =>
        from(this.sessionVault.unlock()).pipe(
          mergeMap(() => this.auth.getUserInfo()),
          map((user) => unlockSessionSuccess({ user })),
          catchError(() => of(unlockSessionFailure()))
        )
      )
    )
  );

  logout$ = createEffect(() =>
    this.actions$.pipe(
      ofType(logout),
      exhaustMap(() =>
        from(this.auth.logout()).pipe(
          tap(() => this.sessionVault.clearSession()),
          map(() => logoutSuccess()),
          catchError(() => of(logoutFailure({ errorMessage: 'Unknown error in logout' })))
        )
      )
    )
  );

  navigateToLogin$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(logoutSuccess, sessionLocked),
        tap(() => this.navController.navigateRoot(['/', 'login']))
      ),
    { dispatch: false }
  );

  navigateToRoot$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(loginSuccess, unlockSessionSuccess),
        tap(() => this.navController.navigateRoot(['/']))
      ),
    { dispatch: false }
  );

  unauthError$ = createEffect(() =>
    this.actions$.pipe(
      ofType(unauthError),
      tap(() => {
        this.sessionVault.clearSession();
      }),
      map(() => logoutSuccess())
    )
  );

  constructor(
    private actions$: Actions,
    private auth: AuthenticationService,
    private navController: NavController,
    private sessionVault: SessionVaultService
  ) {}

  private async performLogin(mode: UnlockMode): Promise<void> {
    await this.sessionVault.clearSession();
    if (mode) {
      await this.sessionVault.setUnlockMode(mode);
    }
    await this.auth.login();
  }
}
