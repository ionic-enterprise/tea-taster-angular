import { TestBed } from '@angular/core/testing';
import { AuthenticationService, SessionVaultService } from '@app/core';
import { createAuthenticationServiceMock, createSessionVaultServiceMock } from '@app/core/testing';
import {
  login,
  loginSuccess,
  logout,
  logoutSuccess,
  sessionLocked,
  unauthError,
  unlockSession,
  unlockSessionSuccess,
} from '@app/store/actions';
import { NavController } from '@ionic/angular';
import { provideMockActions } from '@ngrx/effects/testing';
import { createNavControllerMock } from '@test/mocks';
import { Observable, of } from 'rxjs';
import { AuthEffects } from './auth.effects';

describe('AuthEffects', () => {
  let actions$: Observable<any>;
  let effects: AuthEffects;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthEffects,
        provideMockActions(() => actions$),
        {
          provide: AuthenticationService,
          useFactory: createAuthenticationServiceMock,
        },
        { provide: NavController, useFactory: createNavControllerMock },
        {
          provide: SessionVaultService,
          useFactory: createSessionVaultServiceMock,
        },
      ],
    });
    effects = TestBed.inject(AuthEffects);
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  describe('login$', () => {
    it('wipes out any existing vault session', (done) => {
      const vault = TestBed.inject(SessionVaultService);
      actions$ = of(login({ mode: 'NeverLock' }));
      effects.login$.subscribe(() => {
        expect(vault.clearSession).toHaveBeenCalledTimes(1);
        done();
      });
    });

    it('sets the mode if one is specified', (done) => {
      const vault = TestBed.inject(SessionVaultService);
      actions$ = of(login({ mode: 'Device' }));
      effects.login$.subscribe(() => {
        expect(vault.setUnlockMode).toHaveBeenCalledTimes(1);
        expect(vault.setUnlockMode).toHaveBeenCalledWith('Device');
        done();
      });
    });

    it('does not set the mode if one is not specified', (done) => {
      const vault = TestBed.inject(SessionVaultService);
      actions$ = of(login({}));
      effects.login$.subscribe(() => {
        expect(vault.setUnlockMode).not.toHaveBeenCalled();
        done();
      });
    });

    it('performs a login operation', (done) => {
      const auth = TestBed.inject(AuthenticationService);
      actions$ = of(login({ mode: 'ForceLogin' }));
      effects.login$.subscribe(() => {
        expect(auth.login).toHaveBeenCalledTimes(1);
        expect(auth.login).toHaveBeenCalledWith();
        done();
      });
    });

    describe('on login success', () => {
      it('gets the user information', (done) => {
        const auth = TestBed.inject(AuthenticationService);
        actions$ = of(login({}));
        effects.login$.subscribe(() => {
          expect(auth.getUserInfo).toHaveBeenCalledTimes(1);
          done();
        });
      });

      it('dispatches login success', (done) => {
        const auth = TestBed.inject(AuthenticationService);
        (auth.getUserInfo as any).and.returnValue(
          Promise.resolve({
            id: 73,
            firstName: 'Ken',
            lastName: 'Sodemann',
            email: 'test@test.com',
          })
        );
        actions$ = of(login({}));
        effects.login$.subscribe((action) => {
          expect(action).toEqual({
            type: '[Auth API] login success',
            user: {
              id: 73,
              firstName: 'Ken',
              lastName: 'Sodemann',
              email: 'test@test.com',
            },
          });
          done();
        });
      });
    });

    describe('on login error', () => {
      beforeEach(() => {
        const auth = TestBed.inject(AuthenticationService);
        (auth.login as any).and.returnValue(Promise.reject(new Error('the server is blowing chunks')));
      });

      it('dispatches the login failure event', (done) => {
        actions$ = of(login({}));
        effects.login$.subscribe((action) => {
          expect(action).toEqual({
            type: '[Auth API] login failure',
            errorMessage: 'Unknown error in login',
          });
          done();
        });
      });
    });
  });

  describe('unlockSession$', () => {
    it('attempts to unlock the vault', (done) => {
      const vault = TestBed.inject(SessionVaultService);
      actions$ = of(unlockSession());
      effects.unlockSession$.subscribe(() => {
        expect(vault.unlock).toHaveBeenCalledTimes(1);
        done();
      });
    });

    describe('unlock success', () => {
      it('gets the user information', (done) => {
        const auth = TestBed.inject(AuthenticationService);
        actions$ = of(unlockSession());
        effects.unlockSession$.subscribe(() => {
          expect(auth.getUserInfo).toHaveBeenCalledTimes(1);
          done();
        });
      });

      it('dispatches unlock success', (done) => {
        const auth = TestBed.inject(AuthenticationService);
        (auth.getUserInfo as any).and.returnValue(
          Promise.resolve({
            id: 73,
            firstName: 'Ken',
            lastName: 'Sodemann',
            email: 'test@test.com',
          })
        );
        actions$ = of(unlockSession());
        effects.unlockSession$.subscribe((action) => {
          expect(action).toEqual({
            type: '[Vault API] unlock session success',
            user: {
              id: 73,
              firstName: 'Ken',
              lastName: 'Sodemann',
              email: 'test@test.com',
            },
          });
          done();
        });
      });
    });

    describe('unlock failure', () => {
      beforeEach(() => {
        const vault = TestBed.inject(SessionVaultService);
        (vault.unlock as any).and.returnValue(Promise.reject(new Error('the vault is blowing chunks')));
      });

      it('dispatches unlock failure', (done) => {
        actions$ = of(unlockSession());
        effects.unlockSession$.subscribe((action) => {
          expect(action).toEqual({
            type: '[Vault API] unlock session failure',
          });
          done();
        });
      });
    });
  });

  describe('logout$', () => {
    beforeEach(() => {
      const auth = TestBed.inject(AuthenticationService);
      (auth.logout as any).and.returnValue(of(undefined));
    });

    it('performs a logout operation', (done) => {
      const auth = TestBed.inject(AuthenticationService);
      actions$ = of(logout());
      effects.logout$.subscribe(() => {
        expect(auth.logout).toHaveBeenCalledTimes(1);
        done();
      });
    });

    it('clears the session', (done) => {
      const sessionVaultService = TestBed.inject(SessionVaultService);
      actions$ = of(logout());
      effects.logout$.subscribe(() => {
        expect(sessionVaultService.clearSession).toHaveBeenCalledTimes(1);
        done();
      });
    });

    it('dispatches logout success', (done) => {
      actions$ = of(logout());
      effects.logout$.subscribe((action) => {
        expect(action).toEqual({
          type: '[Auth API] logout success',
        });
        done();
      });
    });

    describe('on a logout error', () => {
      beforeEach(() => {
        const auth = TestBed.inject(AuthenticationService);
        (auth.logout as any).and.returnValue(Promise.reject(new Error('the server is blowing chunks')));
      });

      it('does not clear the session from storage', (done) => {
        const sessionVaultService = TestBed.inject(SessionVaultService);
        actions$ = of(logout());
        effects.logout$.subscribe(() => {
          expect(sessionVaultService.clearSession).not.toHaveBeenCalled();
          done();
        });
      });

      it('dispatches the logout failure event', (done) => {
        actions$ = of(logout());
        effects.logout$.subscribe((action) => {
          expect(action).toEqual({
            type: '[Auth API] logout failure',
            errorMessage: 'Unknown error in logout',
          });
          done();
        });
      });
    });
  });

  [
    loginSuccess({
      user: {
        id: 73,
        firstName: 'Ken',
        lastName: 'Sodemann',
        email: 'test@test.com',
      },
    }),
    unlockSessionSuccess({
      user: {
        id: 73,
        firstName: 'Ken',
        lastName: 'Sodemann',
        email: 'test@test.com',
      },
    }),
  ].forEach((action) =>
    describe(`navigateToRoot$ for ${action.type}`, () => {
      it('navigates to the root path', (done) => {
        const navController = TestBed.inject(NavController);
        actions$ = of(action);
        effects.navigateToRoot$.subscribe(() => {
          expect(navController.navigateRoot).toHaveBeenCalledTimes(1);
          expect(navController.navigateRoot).toHaveBeenCalledWith(['/']);
          done();
        });
      });
    })
  );

  [logoutSuccess(), sessionLocked()].forEach((action) =>
    describe(`navigateToLogin$ for ${action.type}`, () => {
      it('navigates to the login path', (done) => {
        const navController = TestBed.inject(NavController);
        actions$ = of(action);
        effects.navigateToLogin$.subscribe(() => {
          expect(navController.navigateRoot).toHaveBeenCalledTimes(1);
          expect(navController.navigateRoot).toHaveBeenCalledWith(['/', 'login']);
          done();
        });
      });
    })
  );

  describe('unauthError$', () => {
    it('clears the session from storage', (done) => {
      const sessionVaultService = TestBed.inject(SessionVaultService);
      actions$ = of(unauthError());
      effects.unauthError$.subscribe(() => {
        expect(sessionVaultService.clearSession).toHaveBeenCalledTimes(1);
        done();
      });
    });

    it('dispatches the logout success event', (done) => {
      actions$ = of(unauthError());
      effects.unauthError$.subscribe((action) => {
        expect(action).toEqual({
          type: '[Auth API] logout success',
        });
        done();
      });
    });
  });
});
