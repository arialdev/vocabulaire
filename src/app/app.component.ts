import {Component, Injector, OnInit} from '@angular/core';
import {AbstractStorageService} from './services/storage/abstract-storage-service';
import {SettingsService} from './services/settings/settings.service';
import {CollectionService} from './services/collection/collection.service';
import {Tag} from './classes/tag/tag';
import {MenuController, NavController, ToastController} from '@ionic/angular';
import {TagService} from './services/tag/tag.service';
import {PdfService} from './services/pdf/pdf.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
  public tags: Tag[];
  maxTagsBound: number;

  private isCordovaReady: boolean;
  private toast: HTMLIonToastElement;
  private pdfService: PdfService;
  private toastController: ToastController;

  constructor(
    private storageService: AbstractStorageService,
    private settingsService: SettingsService,
    private collectionService: CollectionService,
    private navController: NavController,
    private menuController: MenuController,
    private tagService: TagService,
    private injector: Injector
  ) {
    this.pdfService = injector.get(PdfService);
    this.toastController = injector.get(ToastController);
    this.tags = [];
    this.maxTagsBound = TagService.maxTagsBound;
    this.isCordovaReady = false;
    this.checkCordovaAvailability();
  }

  async ngOnInit(): Promise<void> {
    await this.loadTheme();
  }

  async loadTags() {
    this.tags = (await this.collectionService.getActiveCollection()).getTags();
  }

  async loadTag(tag: Tag) {
    TagService.loadTag(tag);
    await this.menuController.close();
  }

  async exportPDFFromTag(tag: Tag): Promise<void> {
    if (!this.isCordovaReady) {
      this.checkCordovaAvailability();
      const availability = await new Promise<boolean>(resolve => setTimeout(() => resolve(this.isCordovaReady), 500));
      if (!availability) {
        await this.toast?.dismiss();
        this.toast = await this.toastController.create({
          header: 'Error',
          message: 'Device cannot generate PDFs',
          color: 'danger',
          duration: 1000
        });
        return this.toast.present();
      }
    }
    const activeCollection = await this.collectionService.getActiveCollection();
    await Promise.allSettled([
      this.pdfService.generatePDF(activeCollection.getId(), tag.getId()),
      this.menuController.close()
    ]);
  }

  async deleteTag(tag: Tag) {
    const activeCollection = await this.collectionService.getActiveCollection();
    await this.tagService.removeTag(tag.getId(), activeCollection.getId());
    await this.loadTags();
  }

  private async loadTheme() {
    await this.settingsService.loadTheme();
  }

  private checkCordovaAvailability(): void {
    document.addEventListener('deviceready', () => {
      this.isCordovaReady = true;
    });
  }
}
