import {Component} from '@angular/core';
import {Collection} from '../../classes/collection/collection';
import {CollectionService} from '../../services/collection/collection.service';
import {ActivatedRoute, Router} from '@angular/router';
import {ToastController} from '@ionic/angular';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-collections',
  templateUrl: './collections.page.html',
  styleUrls: ['./collections.page.scss'],
})
export class CollectionsPage {

  public collections: Collection [];
  public managingMode: boolean;
  private toast: HTMLIonToastElement;

  constructor(
    private collectionService: CollectionService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private toastController: ToastController,
    private translateService: TranslateService
  ) {
    this.collections = [];
    this.managingMode = false;
  }

  async ionViewWillEnter(): Promise<void> {
    this.managingMode = false;
    await this.loadCollections();
  }

  toggleManage() {
    this.managingMode = !this.managingMode;
  }

  async onItemClick(id): Promise<void> {
    if (this.managingMode) {
      await this.navigateToCollection(id);
    } else {
      await this.setActive(id);
    }
  }

  async navigateToCollection(id?: number) {
    await this.router.navigate([`${id ?? 'new'}`], {
      relativeTo: this.activatedRoute
    });
  }

  private async setActive(id): Promise<void> {
    const collection = this.collections.find(c => c.getId() === id);
    await this.collectionService.setActiveCollection(id);
    this.collections.filter(c => c.isActive()).forEach(c => c.setInactive());
    //If we reload the updated collections they'd be unsorted, so we just update the view manually
    collection.setActive();

    await this.toast?.dismiss();
    this.toast = await this.toastController.create({
      message: await this.translateService.get('collections.toast.active', {name: collection.getLanguage().getName()}).toPromise(),
      icon: 'star',
      color: 'success',
      duration: 800,
    });
    await this.toast.present();
  }

  private async loadCollections(): Promise<void> {
    const collections = (await this.collectionService.getCollections()).filter((c => c.getStatus()));
    this.collections = this.collectionService.sortCollections(collections);
  }
}
