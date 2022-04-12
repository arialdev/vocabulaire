import {Component, OnInit} from '@angular/core';
import {MenuController} from '@ionic/angular';
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
    private menuController: MenuController,
    private settingsService: SettingsService
  ) {
    this.languages = this.settingsService.getLanguages();
  }

  async ngOnInit() {
    await this.menuController.enable(false, 'main-content');
    this.darkMode = await this.settingsService.isDarkMode();
    const language: GuiLanguage = await this.settingsService.getPreferredLanguage();
    this.preferredLanguage = language ?? this.languages[0];
  }

  setLanguage(event) {
    console.log(event.detail);
  }

  async toggleTheme(event) {
    if (await this.settingsService.isDarkMode() !== event.detail.checked) {
      await this.settingsService.toggleTheme();
    }
  }
}
