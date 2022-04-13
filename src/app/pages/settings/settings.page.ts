import {Component, OnInit} from '@angular/core';
import {SettingsService} from '../../services/settings/settings.service';
import {GuiLanguage} from '../../interfaces/gui-language';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {
  preferredLanguage: GuiLanguage;
  darkMode: boolean;
  languages: GuiLanguage[];

  constructor(
    private settingsService: SettingsService
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
}
