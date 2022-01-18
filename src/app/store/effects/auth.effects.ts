import { Injectable } from '@angular/core';
import { NavController } from '@ionic/angular';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { from, of } from 'rxjs';
import { catchError, exhaustMap, map, tap } from 'rxjs/operators';

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
import { AuthenticationService, SessionVaultService } from '@app/core';

@Injectable()
export class AuthEffects {
  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(login),
      exhaustMap((action) =>
        this.auth.login(action.email, action.password).pipe(
          tap((session) => {
            if (session) {
              this.sessionVault.login(session, action.mode);
            }
          }),
          map((session) =>
            session ? loginSuccess({ session }) : loginFailure({ errorMessage: 'Invalid Username or Password' })
          ),
          catchError(() => of(loginFailure({ errorMessage: 'Unknown error in login' })))
        )
      )
    )
  );

  unlockSession$ = createEffect(() =>
    this.actions$.pipe(
      ofType(unlockSession),
      exhaustMap(() =>
        from(this.sessionVault.restoreSession()).pipe(
          map((session) => (session ? unlockSessionSuccess() : unlockSessionFailure())),
          catchError(() => of(unlockSessionFailure()))
        )
      )
    )
  );

  logout$ = createEffect(() =>
    this.actions$.pipe(
      ofType(logout),
      exhaustMap(() =>
        this.auth.logout().pipe(
          tap(() => this.sessionVault.logout()),
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
        this.sessionVault.logout();
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
}
