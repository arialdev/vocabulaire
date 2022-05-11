export abstract class AbstractStorageService {
  public abstract get(key: string): Promise<any>;

  public abstract set(key: string, value: any): Promise<any>;

  public abstract remove(key: string): Promise<any>;

  public abstract exportData(): Promise<any>;

  public abstract importData(file: File): Promise<boolean>;
}
