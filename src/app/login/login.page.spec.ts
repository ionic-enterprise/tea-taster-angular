import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { SessionVaultService } from '@app/core';
import { createSessionVaultServiceMock } from '@app/core/testing';
import { selectAuthErrorMessage } from '@app/store';
import { login, unlockSession } from '@app/store/actions';
import { AuthState, initialState } from '@app/store/reducers/auth.reducer';
import { Device } from '@ionic-enterprise/identity-vault';
import { AlertController, IonicModule, Platform } from '@ionic/angular';
import { Store } from '@ngrx/store';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { createOverlayControllerMock, createOverlayElementMock, createPlatformMock } from '@test/mocks';
import { LoginPage } from './login.page';

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

  it('displays the title properly', () => {
    const title = fixture.debugElement.query(By.css('ion-title'));
    expect(title.nativeElement.textContent.trim()).toBe('Login');
  });

  const registerInputBindingTests = () => {
    describe('email input binding', () => {
      it('updates the component model when the input changes', () => {
        const input = fixture.nativeElement.querySelector('#email-input');
        setInputValue(input, 'test@test.com');
        expect(component.email).toEqual('test@test.com');
      });

      it('updates the input when the component model changes', fakeAsync(() => {
        component.email = 'testy@mctesterson.com';
        fixture.detectChanges();
        tick();
        const input = fixture.nativeElement.querySelector('#email-input');
        expect(input.value).toEqual('testy@mctesterson.com');
      }));
    });

    describe('password input binding', () => {
      it('updates the component model when the input changes', () => {
        const input = fixture.nativeElement.querySelector('#password-input');
        setInputValue(input, 'MyPas$Word');
        expect(component.password).toEqual('MyPas$Word');
      });

      it('updates the input when the component model changes', fakeAsync(() => {
        component.password = 'SomePassword';
        fixture.detectChanges();
        tick();
        const input = fixture.nativeElement.querySelector('#password-input');
        expect(input.value).toEqual('SomePassword');
      }));
    });

    describe('sign in button', () => {
      let button: HTMLIonButtonElement;
      let email: HTMLIonInputElement;
      let password: HTMLIonInputElement;
      beforeEach(fakeAsync(() => {
        button = fixture.nativeElement.querySelector('ion-button');
        email = fixture.nativeElement.querySelector('#email-input');
        password = fixture.nativeElement.querySelector('#password-input');
        fixture.detectChanges();
        tick();
      }));

      it('displays the sign in text', () => {
        expect(button.textContent.trim()).toBe('Sign In');
      });

      it('starts disabled', () => {
        expect(button.disabled).toEqual(true);
      });

      it('is disabled with just an email address', () => {
        setInputValue(email, 'test@test.com');
        expect(button.disabled).toEqual(true);
      });

      it('is disabled with just a password', () => {
        setInputValue(password, 'MyPassW0rd');
        expect(button.disabled).toEqual(true);
      });

      it('is enabled with both an email address and a password', () => {
        setInputValue(email, 'test@test.com');
        setInputValue(password, 'MyPassW0rd');
        expect(button.disabled).toEqual(false);
      });

      it('is disabled when the email address is not a valid format', () => {
        setInputValue(email, 'test');
        setInputValue(password, 'MyPassW0rd');
        expect(button.disabled).toEqual(true);
      });

      it('it dispatches login on click', () => {
        const store = TestBed.inject(Store);
        const dispatchSpy = spyOn(store, 'dispatch');
        setInputValue(email, 'test@test.com');
        setInputValue(password, 'MyPassW0rd');
        component.authMode = 'SessionPIN';
        click(button);
        expect(dispatchSpy).toHaveBeenCalledTimes(1);
        expect(dispatchSpy).toHaveBeenCalledWith(
          login({
            email: 'test@test.com',
            password: 'MyPassW0rd',
            mode: 'SessionPIN',
          })
        );
      });
    });

    describe('error messages', () => {
      let errorDiv: HTMLDivElement;
      let email: HTMLIonInputElement;
      let password: HTMLIonInputElement;
      beforeEach(fakeAsync(() => {
        errorDiv = fixture.nativeElement.querySelector('.error-message');
        email = fixture.nativeElement.querySelector('#email-input');
        password = fixture.nativeElement.querySelector('#password-input');
        fixture.detectChanges();
        tick();
      }));

      it('starts with no error message', () => {
        expect(errorDiv.textContent).toEqual('');
      });

      it('displays an error message if the e-mail address is dirty and empty', () => {
        setInputValue(email, 'test@test.com');
        setInputValue(email, '');
        expect(errorDiv.textContent.trim()).toEqual('E-Mail Address is required');
      });

      it('displays an error message if the e-mail address has an invalid format', () => {
        setInputValue(email, 'test');
        expect(errorDiv.textContent.trim()).toEqual('E-Mail Address must have a valid format');
      });

      it('clears the error message when the e-mail address has a valid format', () => {
        setInputValue(email, 'test');
        expect(errorDiv.textContent.trim()).toEqual('E-Mail Address must have a valid format');
        setInputValue(email, 'test@test.com');
        expect(errorDiv.textContent.trim()).toEqual('');
      });

      it('displays an error message if the password is dirty and empty', () => {
        setInputValue(password, 'Pas$W0rd');
        expect(errorDiv.textContent.trim()).toEqual('');
        setInputValue(password, '');
        setInputValue(password, 'Password is required');
      });

      it('displays the auth state error message if there is one', () => {
        const store = TestBed.inject(Store) as MockStore;
        const mockErrorMessageSelector = store.overrideSelector(selectAuthErrorMessage, '');
        store.refreshState();
        fixture.detectChanges();
        expect(errorDiv.textContent.trim()).toEqual('');
        mockErrorMessageSelector.setResult('Invalid Email or Password');
        store.refreshState();
        fixture.detectChanges();
        expect(errorDiv.textContent.trim()).toEqual('Invalid Email or Password');
        mockErrorMessageSelector.setResult('');
        store.refreshState();
        fixture.detectChanges();
        expect(errorDiv.textContent.trim()).toEqual('');
      });
    });
  };

  describe('on mobile', () => {
    beforeEach(() => {
      spyOn(Device, 'isBiometricsEnabled');
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
        const unlock = fixture.debugElement.query(By.css('.unlock-app'));
        expect(unlock).toBeTruthy();
      });

      it('hides the login parts of the page', () => {
        const email = fixture.debugElement.query(By.css('#email-input'));
        const pwd = fixture.debugElement.query(By.css('#password-input'));
        const sel = fixture.debugElement.query(By.css('#auth-mode-select'));
        expect(email).toBeFalsy();
        expect(pwd).toBeFalsy();
        expect(sel).toBeFalsy();
      });

      it('dispatches unlock session with click of unlock item', async () => {
        const unlock = fixture.debugElement.query(By.css('.unlock-app')).nativeElement;
        const store = TestBed.inject(Store);
        spyOn(store, 'dispatch');
        click(unlock);
        await fixture.whenStable();
        expect(store.dispatch).toHaveBeenCalledTimes(1);
        expect(store.dispatch).toHaveBeenCalledWith(unlockSession());
      });

      it('changes the sign in button prompt', () => {
        const button = fixture.debugElement.query(By.css('ion-button'));
        expect(button.nativeElement.textContent.trim()).toBe('Sign In Instead');
      });

      it('switches to the login view when the sign in button is clicked', () => {
        const store = TestBed.inject(Store);
        spyOn(store, 'dispatch');
        const button = fixture.debugElement.query(By.css('ion-button'));
        click(button.nativeElement);
        fixture.detectChanges();
        const email = fixture.debugElement.query(By.css('#email-input'));
        const pwd = fixture.debugElement.query(By.css('#password-input'));
        const sel = fixture.debugElement.query(By.css('#auth-mode-select'));
        const unlock = fixture.debugElement.query(By.css('.unlock-app'));
        expect(email).toBeTruthy();
        expect(pwd).toBeTruthy();
        expect(sel).toBeTruthy();
        expect(unlock).toBeFalsy();
        expect(button.nativeElement.textContent.trim()).toBe('Sign In');
        expect(store.dispatch).not.toHaveBeenCalled();
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

    describe('without an unlockable session', () => {
      beforeEach(async () => {
        const vault = TestBed.inject(SessionVaultService);
        (vault.canUnlock as any).and.returnValue(Promise.resolve(false));
        await component.ngOnInit();
        fixture.detectChanges();
      });

      it('does not display the unlock item', () => {
        const unlock = fixture.debugElement.query(By.css('.unlock-app'));
        expect(unlock).toBeFalsy();
      });

      it('displays the login parts of the page', () => {
        const email = fixture.debugElement.query(By.css('#email-input'));
        const pwd = fixture.debugElement.query(By.css('#password-input'));
        const sel = fixture.debugElement.query(By.css('#auth-mode-select'));
        expect(email).toBeTruthy();
        expect(pwd).toBeTruthy();
        expect(sel).toBeTruthy();
      });

      it('includes the base session locking methods', () => {
        const sel = fixture.debugElement.query(By.css('#auth-mode-select'));
        const opt = sel.queryAll(By.css('ion-select-option'));
        expect(opt.length).toBe(3);
        expect(opt[0].nativeElement.value).toBe('SessionPIN');
        expect(opt[1].nativeElement.value).toBe('NeverLock');
        expect(opt[2].nativeElement.value).toBe('ForceLogin');
      });

      it('defaults the auth mode to the first one', () => {
        expect(component.authMode).toBe('SessionPIN');
      });

      registerInputBindingTests();

      describe('when biometrics is available', () => {
        beforeEach(async () => {
          (Device.isBiometricsEnabled as any).and.returnValue(Promise.resolve(true));
          await component.ngOnInit();
          fixture.detectChanges();
        });

        it('adds biometrics as the first locking option', () => {
          const sel = fixture.debugElement.query(By.css('#auth-mode-select'));
          const opt = sel.queryAll(By.css('ion-select-option'));
          expect(opt.length).toBe(4);
          expect(opt[0].nativeElement.value).toBe('Device');
        });

        it('defaults the auth mode to the first one', () => {
          expect(component.authMode).toBe('Device');
        });
      });
    });
  });

  describe('on web', () => {
    beforeEach(() => {
      const platform = TestBed.inject(Platform);
      (platform.is as any).withArgs('hybrid').and.returnValue(false);
    });

    it('displays the login parts of the page', () => {
      const email = fixture.debugElement.query(By.css('#email-input'));
      const pwd = fixture.debugElement.query(By.css('#password-input'));
      expect(email).toBeTruthy();
      expect(pwd).toBeTruthy();
    });

    it('does not allow selection of an auth mode', () => {
      const sel = fixture.debugElement.query(By.css('#auth-mode-select'));
      expect(sel).toBeFalsy();
    });

    registerInputBindingTests();
  });

  const click = (button: HTMLElement) => {
    const event = new Event('click');
    button.dispatchEvent(event);
    fixture.detectChanges();
  };

  const setInputValue = (input: HTMLIonInputElement, value: string) => {
    const event = new InputEvent('ionChange');
    input.value = value;
    input.dispatchEvent(event);
    fixture.detectChanges();
  };
});
