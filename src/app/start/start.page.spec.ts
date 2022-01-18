import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { SessionVaultService } from '@app/core';
import { createSessionVaultServiceMock } from '@app/core/testing';
import { IonicModule, NavController } from '@ionic/angular';
import { createNavControllerMock } from '@test/mocks';

import { StartPage } from './start.page';

describe('StartPage', () => {
  let component: StartPage;
  let fixture: ComponentFixture<StartPage>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [StartPage],
        imports: [IonicModule.forRoot()],
        providers: [
          { provide: NavController, useFactory: createNavControllerMock },
          { provide: SessionVaultService, useFactory: createSessionVaultServiceMock },
        ],
      }).compileComponents();

      fixture = TestBed.createComponent(StartPage);
      component = fixture.componentInstance;
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
