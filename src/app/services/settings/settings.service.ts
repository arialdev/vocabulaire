import {Injectable} from '@angular/core';
import {AbstractStorageService} from '../storage/abstract-storage-service';
import {Settings} from '../../interfaces/settings';
import {GuiLanguage} from '../../interfaces/gui-language';
import {TranslateService} from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  private darkMode: boolean;
  private preferredLanguage: GuiLanguage;
  private readonly languages: GuiLanguage[];

  constructor(private storageService: AbstractStorageService, private translateService: TranslateService) {
    this.initializeService();
    this.languages = [
      {prefix: 'en', name: 'English'},
      {prefix: 'es', name: 'Castellano'},
      {prefix: 'fr', name: 'Français'},
      {prefix: 'it', name: 'Italiano'}
    ];
  }

  public async isDarkMode(): Promise<boolean> {
    if (this.darkMode === undefined) {
      await this.initializeService();
    }
    return this.darkMode;
  }

  public async getPreferredLanguage(): Promise<GuiLanguage> {
    if (!this.preferredLanguage) {
      await this.initializeService();
    }
    return this.preferredLanguage;
  }

  public getLanguages(): GuiLanguage[] {
    return this.languages;
  }

  public async loadTheme() {
    if (this.darkMode === undefined) {
      await this.initializeService();
    }
    if (this.darkMode) {
      document.body.setAttribute('data-theme', 'dark');
    } else {
      document.body.setAttribute('data-theme', 'light');
    }
  }

  public async toggleTheme() {
    if (this.darkMode === undefined) {
      await this.initializeService();
    }
    this.darkMode = !this.darkMode;
    const settings: Settings = await this.storageService.get('settings');
    settings.darkMode = this.darkMode;
    await this.storageService.set('settings', settings);
    await this.loadTheme();
  }

  public async setLanguage(language: GuiLanguage): Promise<void> {
    if (this.languages.some(l => l.prefix === language.prefix)) {
      const settings: Settings = await this.getSettingsFromDisk();
      settings.preferredLanguage = language;
      this.preferredLanguage = language;
      await this.storageService.set('settings', settings);
      this.translateService.use(language.prefix);
    }
  }

  async initializeService(): Promise<void> {
    const settings: Settings = await this.getSettingsFromDisk();
    this.darkMode = settings.darkMode;
    this.preferredLanguage = settings.preferredLanguage;
    this.translateService.setDefaultLang(this.languages[0].prefix);
    this.translateService.use(this.preferredLanguage.prefix);
    await this.loadTheme();
  }

  async initializeApp(): Promise<void> {
    return this.storageService.set('initialized', true);
  }

  async isInitialized(): Promise<boolean> {
    return (await this.storageService.get('initialized')) ?? false;
  }

  private async getSettingsFromDisk(): Promise<Settings> {
    return this.storageService.get('settings');
  }
}
