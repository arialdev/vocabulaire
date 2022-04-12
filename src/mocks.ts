import {AlertOptions} from '@ionic/angular';
import {Observable} from 'rxjs';
import {Pipe, PipeTransform} from '@angular/core';

export const mockTimeLapse = (originalTime: number, predicate: (previousTime: number) => void) => {
  const clock = jasmine.clock().install();
  clock.mockDate(new Date(2000, 1, 1));
  predicate(originalTime);
  clock.uninstall();
};

export class MockNavController {
  public navigateBack = (): Promise<boolean> => Promise.resolve(true);
  public navigateForward = (): Promise<boolean> => Promise.resolve(true);
  public navigateRoot = (): Promise<boolean> => Promise.resolve(true);
}

export class MockAlertController {
  private createAlertCalled: boolean;
  private opts: AlertOptions;

  create(opts?: AlertOptions): Promise<HTMLIonAlertElement> {
    this.createAlertCalled = true;
    this.opts = opts;
    return Promise.resolve({
      present: (): Promise<void> => Promise.resolve()
    } as HTMLIonAlertElement);
  }
}

@Pipe({
  name: 'translate'
})
export class MockTranslatePipe implements PipeTransform {
  public name = 'translate';

  public transform(query: string, ..._args: any[]): any {
    return query;
  }
}

export class MockTranslateService {
  setDefaultLang() {
    return;
  }

  get(key: string | string[]): Observable<string | string[]> {
    return Array.isArray(key) ? new Observable<string | string[]>(o => {
      o.next(['sample']);
      o.complete();
    }) : new Observable(o => {
      o.next('sample');
      o.complete();
    });
  }
}

export class MockMenuController {
  enable() {
    return Promise.resolve();
  }
}
