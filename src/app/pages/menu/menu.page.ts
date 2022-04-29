import {Component} from '@angular/core';
import {Router, RouterEvent} from '@angular/router';
import {Tag} from '../../classes/tag/tag';
import {TagService} from '../../services/tag/tag.service';
import {CollectionService} from '../../services/collection/collection.service';
import {MenuController, ToastController} from '@ionic/angular';
import {PdfService} from '../../services/pdf/pdf.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.page.html',
  styleUrls: ['./menu.page.scss'],
})
export class MenuPage {
  selectedPath = '';
  public tags: Tag[];
  maxTagsBound: number;

  private isCordovaReady: boolean;
  private toast: HTMLIonToastElement;

  constructor(
    private router: Router,
    private collectionService: CollectionService,
    private menuController: MenuController,
    private tagService: TagService,
    private pdfService: PdfService,
    private toastController: ToastController
  ) {
    this.router.events.subscribe((e: RouterEvent) => this.selectedPath = e.url);
    this.tags = [];
    this.maxTagsBound = TagService.maxTagsBound;
    this.isCordovaReady = false;
    this.checkCordovaAvailability();
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

  private checkCordovaAvailability(): void {
    document.addEventListener('deviceready', () => {
      this.isCordovaReady = true;
    });
  }

}
