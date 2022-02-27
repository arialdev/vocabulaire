export class NavMock {
  public navigateBack = (url: string | any[], options: any) => {
  };
  public navigateForward = (url: string | any[], options: any) => {
  };
  public navigateRoot = (url: string | any[], options: any) => {
  };
}

export class StorageMock {
  private storage: Map<string, any>;

  constructor() {
    this.storage = new Map<string, any>();
  }

  public create = () => Promise.resolve();
  public defineDriver = (driver: any) => Promise.resolve();
  public get = (key: string) => Promise.resolve(this.storage.get(key));
  public set = (key: string, data: any) => {
    this.storage.set(key, data);
    return Promise.resolve();
  };
  public remove = (key: string) => {
    this.storage.delete(key);
    return Promise.resolve();
  };
  public clear = () => {
    this.storage = new Map<string, any>();
    return Promise.resolve();
  };
}
