export class Language {
  createdAt: number;
  icon: string;
  id: number;
  name: string;
  prefix: string;
  status: boolean;
  updatedAt: number;

  constructor(name: string, prefix: string, icon: string) {
    this.name = name;
    this.prefix = prefix;
    this.icon = icon;
    this.status = true;
    this.createdAt = new Date().getTime();
    this.updatedAt = new Date().getTime();
  }
}
