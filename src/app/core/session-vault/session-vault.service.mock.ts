import { SessionVaultService } from './session-vault.service';

export const createSessionVaultServiceMock = () =>
  jasmine.createSpyObj<SessionVaultService>('SessionVaultService', {
    login: Promise.resolve(),
    restoreSession: Promise.resolve(null),
    logout: Promise.resolve(),
    canUnlock: Promise.resolve(false),
  });
