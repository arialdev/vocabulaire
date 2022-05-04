import {Component, OnInit} from '@angular/core';
import {SettingsService} from '../../services/settings/settings.service';
import {GuiLanguage} from '../../interfaces/gui-language';
import {AbstractStorageService} from '../../services/storage/abstract-storage-service';
import {ToastController} from '@ionic/angular';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {
  fileInput: string;
  preferredLanguage: GuiLanguage;
  darkMode: boolean;
  languages: GuiLanguage[];

  compareWith = compareLanguages;

  private toast: HTMLIonToastElement;

  constructor(
    private settingsService: SettingsService,
    private storageService: AbstractStorageService,
    private toastController: ToastController,
    private translateService: TranslateService
  ) {
    this.fileInput = '';
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

  async importData(event): Promise<void> {
    const res: PromiseSettledResult<boolean> = (await Promise.allSettled([
      this.toast?.dismiss(),
      this.storageService.importData(event.target.files[0])
    ]))[1];
    if (res.status === 'fulfilled' && res.value) {
      await this.settingsService.initializeService();
      await this.ngOnInit();
      this.toast = await this.toastController.create({
        message:  await this.translateService.get('settings.import.toast.success.message').toPromise(),
        color: 'success',
        icon: 'download-outline',
        duration: 800
      });
    } else if (res.status === 'rejected') {
      this.toast = await this.toastController.create({
        header: await this.translateService.get('settings.import.toast.bad-file.title').toPromise(),
        message: await this.translateService.get(res.reason.message).toPromise(),
        color: 'danger',
        icon: 'download',
        duration: 1000
      });
    }
    this.fileInput = '';
    return this.toast.present();
  }

  openFileExplorer() {
    const input = document.getElementById('file-importer');
    input.click();
  }
}

const compareLanguages = (c1: GuiLanguage, c2: GuiLanguage) => c1.prefix === c2.prefix;
