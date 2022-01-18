import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { login, unlockSession } from '@app/store/actions';
import { AuthState, initialState } from '@app/store/reducers/auth.reducer';
import { LoginPage } from './login.page';
import { AlertController, IonicModule, Platform } from '@ionic/angular';
import { Store } from '@ngrx/store';
import { provideMockStore } from '@ngrx/store/testing';
import { createOverlayControllerMock, createOverlayElementMock, createPlatformMock } from '@test/mocks';
import { SessionVaultService } from '@app/core';
import { createSessionVaultServiceMock } from '@app/core/testing';
import { Device } from '@ionic-enterprise/identity-vault';

describe('LoginPage', () => {
  let alert: HTMLIonAlertElement;
  let component: LoginPage;
  let fixture: ComponentFixture<LoginPage>;

  beforeEach(
    waitForAsync(() => {
      alert = createOverlayElementMock('Alert');
      TestBed.configureTestingModule({
        declarations: [LoginPage],
        imports: [FormsModule, IonicModule],
        providers: [
          provideMockStore<{ auth: AuthState }>({
            initialState: { auth: initialState },
          }),
          {
            provide: AlertController,
            useFactory: () => createOverlayControllerMock('AlertController', alert),
          },
          {
            provide: Platform,
            useFactory: createPlatformMock,
          },
          {
            provide: SessionVaultService,
            useFactory: createSessionVaultServiceMock,
          },
        ],
      }).compileComponents();

      fixture = TestBed.createComponent(LoginPage);
      component = fixture.componentInstance;
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  const registerInputBindingTests = () => {
    describe('sign in button', () => {
      let button: HTMLIonButtonElement;
      beforeEach(fakeAsync(() => {
        button = fixture.nativeElement.querySelector('[data-testid="signin-button"]');
        fixture.detectChanges();
        tick();
      }));

      it('it dispatches login on click', () => {
        const store = TestBed.inject(Store);
        const dispatchSpy = spyOn(store, 'dispatch');
        component.unlockMode = 'SessionPIN';
        click(button);
        expect(dispatchSpy).toHaveBeenCalledTimes(1);
        expect(dispatchSpy).toHaveBeenCalledWith(
          login({
            mode: 'SessionPIN',
          })
        );
      });
    });
  };

  describe('on mobile', () => {
    beforeEach(() => {
      const platform = TestBed.inject(Platform);
      (platform.is as any).withArgs('hybrid').and.returnValue(true);
    });

    describe('with a session that can be unlocked', () => {
      beforeEach(async () => {
        const vault = TestBed.inject(SessionVaultService);
        (vault.canUnlock as any).and.returnValue(Promise.resolve(true));
        await component.ngOnInit();
        fixture.detectChanges();
      });

      it('displays the unlock item', () => {
        const button = fixture.debugElement.query(By.css('[data-testid="unlock-button"]'));
        expect(button).toBeTruthy();
      });

      it('hides the sign in button', () => {
        const button = fixture.debugElement.query(By.css('[data-testid="signin-button"]'));
        expect(button).toBeFalsy();
      });

      it('dispatches unlock session with click of unlock item', async () => {
        const button = fixture.debugElement.query(By.css('[data-testid="unlock-button"]')).nativeElement;
        const store = TestBed.inject(Store);
        spyOn(store, 'dispatch');
        click(button);
        await fixture.whenStable();
        expect(store.dispatch).toHaveBeenCalledTimes(1);
        expect(store.dispatch).toHaveBeenCalledWith(unlockSession());
      });

      describe('when the session becomes invalid', () => {
        beforeEach(() => {
          const vault = TestBed.inject(SessionVaultService);
          (vault.canUnlock as any).and.returnValue(Promise.resolve(false));
        });

        it('does not dispatch the unlock', async () => {
          const unlock = fixture.debugElement.query(By.css('.unlock-app')).nativeElement;
          const store = TestBed.inject(Store);
          spyOn(store, 'dispatch');
          click(unlock);
          await fixture.whenStable();
          expect(store.dispatch).not.toHaveBeenCalled();
        });

        it('alerts the user', async () => {
          const alertController = TestBed.inject(AlertController);
          const unlock = fixture.debugElement.query(By.css('.unlock-app')).nativeElement;
          click(unlock);
          await fixture.whenStable();
          expect(alertController.create).toHaveBeenCalledTimes(1);
          expect(alertController.create).toHaveBeenCalledWith({
            header: 'Session Terminated',
            message: 'Your session has been terminated. You must log in again.',
            buttons: ['OK'],
          });
          expect(alert.present).toHaveBeenCalledTimes(1);
        });
      });
    });

    describe('without a session that can be unlocked', () => {
      beforeEach(async () => {
        const vault = TestBed.inject(SessionVaultService);
        (vault.canUnlock as any).and.returnValue(Promise.resolve(false));
        await component.ngOnInit();
        fixture.detectChanges();
      });

      it('does not display the unlock item', () => {
        const button = fixture.debugElement.query(By.css('[data-testid="unlock-button"]'));
        expect(button).toBeFalsy();
      });

      it('displays the sign in button', () => {
        const button = fixture.debugElement.query(By.css('[data-testid="signin-button"]'));
        expect(button).toBeTruthy();
      });

      it('displays the locking options', () => {
        const sel = fixture.debugElement.query(By.css('[data-testid="locking-options"]'));
        expect(sel).toBeTruthy();
      });

      it('includes the base session locking methods', () => {
        const sel = fixture.debugElement.query(By.css('[data-testid="locking-options"]'));
        const opt = sel.queryAll(By.css('ion-radio'));
        expect(opt.length).toBe(3);
        expect(opt[0].nativeElement.value).toBe('SessionPIN');
        expect(opt[1].nativeElement.value).toBe('NeverLock');
        expect(opt[2].nativeElement.value).toBe('ForceLogin');
      });

      it('defaults the auth mode to the first one', () => {
        expect(component.unlockMode).toBe('SessionPIN');
      });

      registerInputBindingTests();

      describe('when biometrics is available', () => {
        beforeEach(async () => {
          spyOn(Device, 'isBiometricsEnabled');
          (Device.isBiometricsEnabled as any).and.returnValue(Promise.resolve(true));
          await component.ngOnInit();
          fixture.detectChanges();
        });

        it('adds biometrics as the first locking option', () => {
          const sel = fixture.debugElement.query(By.css('[data-testid="locking-options"]'));
          const opt = sel.queryAll(By.css('ion-radio'));
          expect(opt.length).toBe(4);
          expect(opt[0].nativeElement.value).toBe('Device');
        });

        it('defaults the auth mode to the first one', () => {
          expect(component.unlockMode).toBe('Device');
        });
      });
    });
  });

  describe('on web', () => {
    beforeEach(() => {
      const platform = TestBed.inject(Platform);
      (platform.is as any).withArgs('hybrid').and.returnValue(false);
    });

    it('displays the login button', () => {
      const button = fixture.debugElement.query(By.css('[data-testid="signin-button"]'));
      expect(button).toBeTruthy();
    });

    it('does not allow selection of an auth mode', () => {
      const sel = fixture.debugElement.query(By.css('[data-testid="locking-options"]'));
      expect(sel).toBeFalsy();
    });

    registerInputBindingTests();
  });

  const click = (button: HTMLElement) => {
    const event = new Event('click');
    button.dispatchEvent(event);
    fixture.detectChanges();
  };
});
