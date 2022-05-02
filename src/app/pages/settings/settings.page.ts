import {Component, OnInit} from '@angular/core';
import {SettingsService} from '../../services/settings/settings.service';
import {GuiLanguage} from '../../interfaces/gui-language';
import {AbstractStorageService} from '../../services/storage/abstract-storage-service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {
  preferredLanguage: GuiLanguage;
  darkMode: boolean;
  languages: GuiLanguage[];

  compareWith = compareLanguages;

  constructor(
    private settingsService: SettingsService,
    private storageService: AbstractStorageService,
  ) {
    this.languages = this.settingsService.getLanguages();
  }

  async ngOnInit() {
    this.darkMode = await this.settingsService.isDarkMode();
    const language: GuiLanguage = await this.settingsService.getPreferredLanguage();
    this.preferredLanguage = language ?? this.languages[0];
  }

  async toggleTheme(event) {
    if (await this.settingsService.isDarkMode() !== event.detail.checked) {
      await this.settingsService.toggleTheme();
    }
  }

  async changeLanguage(event) {
    const language: GuiLanguage = event.detail.value;
    await this.settingsService.setLanguage(language);
  }

  async exportData() {
    await this.storageService.exportData();
  }

  async importData(event) {
    await this.storageService.importData(event.target.files[0]);
    await this.settingsService.initializeService();
    await this.ngOnInit();
  }

  openFileExplorer() {
    document.getElementById('file-importer').click();
  }
}

const compareLanguages = (c1: GuiLanguage, c2: GuiLanguage) => c1.prefix === c2.prefix;
