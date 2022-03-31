export class StoringItem {
  private id: number;
  private status: boolean;
  private createdAt: number;
  private updatedAt: number;

  constructor();
  constructor(id: number, status: boolean, createdAt: number, updatedAt: number);
  constructor(id?: number, status?: boolean, createdAt?: number, updatedAt?: number) {
    this.id = id;
    this.status = status ?? true;
    this.updateCreationTime(createdAt);
    this.updateUpdatedTime(updatedAt);
  }

  public getId(): number {
    return this.id;
  }

  public setId(id: number): void {
    this.id = id;
    this.updateUpdatedTime();
  }

  public getStatus(): boolean {
    return this.status;
  }

  public setStatus(status: boolean): void {
    this.status = status;
    this.updateUpdatedTime();
  }

  public getCreationTime(): number {
    return this.createdAt;
  }

  public getUpdatingTime(): number {
    return this.updatedAt;
  }

  public updateUpdatedTime(): void;
  public updateUpdatedTime(datetime: number): void;
  public updateUpdatedTime(time?: number): void {
    this.updatedAt = time ?? new Date().getTime();
  }

  protected updateCreationTime(): void;
  protected updateCreationTime(datetime: number): void;
  protected updateCreationTime(time?: number): void {
    this.createdAt = time ?? new Date().getTime();
    this.updateUpdatedTime();
  }
}
