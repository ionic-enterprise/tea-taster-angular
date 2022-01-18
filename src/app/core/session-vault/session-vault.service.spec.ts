import { TestBed } from '@angular/core/testing';
import { PinDialogComponent } from '@app/pin-dialog/pin-dialog.component';
import { sessionLocked } from '@app/store/actions';
import { DeviceSecurityType, Vault, VaultType } from '@ionic-enterprise/identity-vault';
import { ModalController, Platform } from '@ionic/angular';
import { Store } from '@ngrx/store';
import { provideMockStore } from '@ngrx/store/testing';
import { createOverlayControllerMock, createOverlayElementMock, createPlatformMock } from '@test/mocks';
import { SessionVaultService, UnlockMode } from './session-vault.service';
import { VaultFactoryService } from './vault-factory.service';

describe('SessionVaultService', () => {
  let modal: HTMLIonModalElement;
  let service: SessionVaultService;

  let onLockCallback: () => void;
  let onPassocodeRequestedCallback: (flag: boolean) => Promise<void>;
  let mockVault: Vault;

  beforeEach(() => {
    mockVault = jasmine.createSpyObj<Vault>('Vault', {
      clear: Promise.resolve(),
      doesVaultExist: Promise.resolve(false),
      isLocked: Promise.resolve(false),
      lock: Promise.resolve(),
      setCustomPasscode: Promise.resolve(),
      updateConfig: Promise.resolve(),
      unlock: Promise.resolve(),
      onLock: undefined,
      onPasscodeRequested: undefined,
    });
    (mockVault.onLock as any).and.callFake((callback: () => void) => (onLockCallback = callback));
    (mockVault.onPasscodeRequested as any).and.callFake(
      (callback: (flag: boolean) => Promise<void>) => (onPassocodeRequestedCallback = callback)
    );
    (mockVault.lock as any).and.callFake(() => onLockCallback());
    modal = createOverlayElementMock('Modal');
    TestBed.configureTestingModule({
      providers: [
        provideMockStore(),
        {
          provide: ModalController,
          useValue: createOverlayControllerMock('ModalController', modal),
        },
        { provide: Platform, useFactory: createPlatformMock },
        {
          provide: VaultFactoryService,
          useValue: jasmine.createSpyObj('VaultFactoryService', {
            create: mockVault,
          }),
        },
      ],
    });
    service = TestBed.inject(SessionVaultService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('setUnlockType', () => {
    [
      {
        unlockMode: 'Device',
        type: VaultType.DeviceSecurity,
        deviceSecurityType: DeviceSecurityType.Both,
      },
      {
        unlockMode: 'SessionPIN',
        type: VaultType.CustomPasscode,
        deviceSecurityType: DeviceSecurityType.SystemPasscode,
      },
      {
        unlockMode: 'ForceLogin',
        type: VaultType.InMemory,
        deviceSecurityType: DeviceSecurityType.SystemPasscode,
      },
      {
        unlockMode: 'NeverLock',
        type: VaultType.SecureStorage,
        deviceSecurityType: DeviceSecurityType.SystemPasscode,
      },
    ].forEach(({ unlockMode, type, deviceSecurityType }) =>
      it(`updates the configuration for ${unlockMode}`, async () => {
        const expectedConfig = {
          ...mockVault.config,
          type,
          deviceSecurityType,
        };
        await service.setUnlockMode(unlockMode as UnlockMode);
        expect(mockVault.updateConfig).toHaveBeenCalledTimes(1);
        expect(mockVault.updateConfig).toHaveBeenCalledWith(expectedConfig);
      })
    );
  });

  describe('clear session', () => {
    it('clears the session', async () => {
      await service.clearSession();
      expect(mockVault.clear).toHaveBeenCalledTimes(1);
    });
  });

  describe('locking', () => {
    it('dispatches sessionLocked', () => {
      const store = TestBed.inject(Store);
      spyOn(store, 'dispatch');
      mockVault.lock();
      expect(store.dispatch).toHaveBeenCalledTimes(1);
      expect(store.dispatch).toHaveBeenCalledWith(sessionLocked());
    });
  });

  describe('can unlock', () => {
    [
      { exists: true, locked: true },
      { exists: false, locked: true },
      { exists: true, locked: false },
    ].forEach(({ exists, locked }) =>
      it(`is ${exists && locked} for ${exists} ${locked}`, async () => {
        (mockVault.doesVaultExist as any).and.returnValue(Promise.resolve(exists));
        (mockVault.isLocked as any).and.returnValue(Promise.resolve(locked));
        expect(await service.canUnlock()).toBe(exists && locked);
      })
    );
  });

  describe('isLocked', () => {
    [true, false].forEach((value: boolean) =>
      it('passes through to the vault', async () => {
        (mockVault.isLocked as any).and.returnValue(Promise.resolve(value));
        expect(await mockVault.isLocked()).toEqual(value);
      })
    );
  });

  describe('unlock', () => {
    it('passes through to the vault', async () => {
      await service.unlock();
      expect(mockVault.unlock).toHaveBeenCalledTimes(1);
    });
  });

  describe('onPasscodeRequested', () => {
    beforeEach(() => {
      (modal.onDidDismiss as any).and.returnValue(Promise.resolve({ role: 'cancel' }));
    });

    [true, false].forEach((setPasscode) => {
      it(`creates a PIN dialog, setting passcode: ${setPasscode}`, async () => {
        const modalController = TestBed.inject(ModalController);
        await onPassocodeRequestedCallback(setPasscode);
        expect(modalController.create).toHaveBeenCalledTimes(1);
        expect(modalController.create).toHaveBeenCalledWith({
          backdropDismiss: false,
          component: PinDialogComponent,
          componentProps: {
            setPasscodeMode: setPasscode,
          },
        });
      });
    });

    it('presents the modal', async () => {
      await onPassocodeRequestedCallback(false);
      expect(modal.present).toHaveBeenCalledTimes(1);
    });

    it('sets the custom passcode to the PIN', async () => {
      (modal.onDidDismiss as any).and.returnValue(Promise.resolve({ data: '4203', role: 'OK' }));
      await onPassocodeRequestedCallback(false);
      expect(mockVault.setCustomPasscode).toHaveBeenCalledTimes(1);
      expect(mockVault.setCustomPasscode).toHaveBeenCalledWith('4203');
    });

    it('sets the custom passcode to and empty string if the PIN is undefined', async () => {
      await onPassocodeRequestedCallback(false);
      expect(mockVault.setCustomPasscode).toHaveBeenCalledTimes(1);
      expect(mockVault.setCustomPasscode).toHaveBeenCalledWith('');
    });
  });
});
