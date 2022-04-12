import {Injectable} from '@angular/core';
import {AbstractStorageService} from '../storage/abstract-storage-service';
import {Settings} from '../../interfaces/settings';
import {GuiLanguage} from '../../interfaces/gui-language';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  private darkMode: boolean;
  private preferredLanguage: GuiLanguage;
  private readonly languages: GuiLanguage[];

  constructor(private storageService: AbstractStorageService) {
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

  private async initializeService(): Promise<void> {
    const settings: Settings = await this.storageService.get('settings');
    this.darkMode = settings.darkMode;
    this.preferredLanguage = settings.preferredLanguage;
    await this.loadTheme();
  }
}
