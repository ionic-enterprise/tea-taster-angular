import { TestBed } from '@angular/core/testing';
import { SessionVaultService } from '../session-vault/session-vault.service';
import { createSessionVaultServiceMock } from '../session-vault/session-vault.service.mock';

import { AuthenticationService } from './authentication.service';

describe('AuthenticationService', () => {
  let service: AuthenticationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: SessionVaultService,
          useFactory: createSessionVaultServiceMock,
        },
      ],
    });
    service = TestBed.inject(AuthenticationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
