import {AlertOptions} from '@ionic/angular';

export const mockTimeLapse = (originalTime: number, predicate: (previousTime: number) => void) => {
  const clock = jasmine.clock().install();
  clock.mockDate(new Date(2000, 1, 1));
  predicate(originalTime);
  clock.uninstall();
};

export class MockNavController {
  public navigateBack = (url: string | any[], options: any): Promise<boolean> => Promise.resolve(true);
  public navigateForward = (url: string | any[], options: any): Promise<boolean> => Promise.resolve(true);
  public navigateRoot = (url: string | any[], options: any): Promise<boolean> => Promise.resolve(true);
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
