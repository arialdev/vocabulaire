export class StoringItem {
  private id: number;
  private status: boolean;
  private createdAt: number;
  private updatedAt: number;

  constructor() {
    this.id = undefined;
    this.status = true;
    this.updateCreationTime();
    this.updateUpdatedTime();
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

  public updateUpdatedTime(): void {
    this.updatedAt = new Date().getTime();
  }

  private updateCreationTime(): void {
    this.createdAt = new Date().getTime();
    this.updateUpdatedTime();
  }
}
