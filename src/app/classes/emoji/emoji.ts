export class Emoji {

  private name: string;
  private emojiCategory: string;

  constructor(emojiData)
  constructor(name: string, category: string);
  constructor(data: string | any, category?: string) {
    if (typeof data === 'string') {
      this.name = data;
      this.emojiCategory = category;
    } else {
      this.name = data.name;
      this.emojiCategory = data.emojiCategory;
    }
  }

  public getName(): string {
    return this.name;
  }

  public setName(name: string): void {
    this.name = name;
  }

  public getCategory(): string {
    return this.emojiCategory;
  }

  public setCategory(category: string): void {
    this.emojiCategory = category;
  }
}
