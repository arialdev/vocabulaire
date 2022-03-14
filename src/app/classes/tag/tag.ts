import {TagOptions} from '../tagOptions/tag-options';
import {StoringItem} from '../storing-item';

export class Tag extends StoringItem {
  private name: string;
  private icon: string;
  private options: TagOptions;

  constructor(tagData);
  constructor(name: string, icon: string, options: TagOptions);
  constructor(data: string | any, icon?: string, options?: TagOptions) {
    if (typeof data === 'string') {
      super();
      this.name = data;
      this.icon = icon;
      this.options = options;
    } else {
      super(data.id, data.status, data.createdAt, data.updatedAt);
      this.name = data.name;
      this.icon = data.icon;
      this.options = new TagOptions(data.options);
    }
  }

  public getName(): string {
    return this.name;
  }

  public setName(name: string): void {
    this.name = name;
    this.updateUpdatedTime();
  }

  public getIcon(): string {
    return this.icon;
  }

  public setIcon(icon: string): void {
    this.icon = icon;
    this.updateUpdatedTime();
  }

  public getOptions(): TagOptions {
    return this.options;
  }

  public setOptions(options: TagOptions): void {
    this.options = options;
    this.updateUpdatedTime();
  }
}
