import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TestBed, waitForAsync } from '@angular/core/testing';
import { Platform } from '@ionic/angular';
import { createPlatformMock } from '@test/mocks';
import { AppComponent } from './app.component';
import { ApplicationService } from './core';
import { createApplicationServiceMock } from './core/testing';

describe('AppComponent', () => {
  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [AppComponent],
        providers: [
          {
            provide: Platform,
            useFactory: createPlatformMock,
          },
          {
            provide: ApplicationService,
            useFactory: createApplicationServiceMock,
          },
        ],
        schemas: [CUSTOM_ELEMENTS_SCHEMA],
      }).compileComponents();
    })
  );

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  });

  describe('in a hybrid mobile context', () => {
    beforeEach(() => {
      const platform = TestBed.inject(Platform);
      (platform.is as any).withArgs('hybrid').and.returnValue(true);
      const fixture = TestBed.createComponent(AppComponent);
      fixture.detectChanges();
    });

    it('registers for updates', () => {
      const application = TestBed.inject(ApplicationService);
      expect(application.registerForUpdates).not.toHaveBeenCalled();
    });
  });

  describe('in a web context', () => {
    beforeEach(() => {
      const platform = TestBed.inject(Platform);
      (platform.is as any).withArgs('hybrid').and.returnValue(false);
      const fixture = TestBed.createComponent(AppComponent);
      fixture.detectChanges();
    });

    it('registers for updates', () => {
      const application = TestBed.inject(ApplicationService);
      TestBed.createComponent(AppComponent);
      expect(application.registerForUpdates).toHaveBeenCalledTimes(1);
    });
  });
});
