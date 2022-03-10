import {Component} from '@angular/core';
import {Collection} from '../../classes/collection/collection';
import {CollectionService} from '../../services/collection/collection.service';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
  selector: 'app-collections',
  templateUrl: './collections.page.html',
  styleUrls: ['./collections.page.scss'],
})
export class CollectionsPage {

  public collections: Collection [];
  public managingMode: boolean;

  constructor(
    private collectionService: CollectionService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) {
    this.collections = [];
    this.managingMode = false;
  }

  async ionViewWillEnter(): Promise<void> {
    this.managingMode = false;
    await this.loadCollections();
  }

  async setActive(id): Promise<void> {
    const collection = this.collections.find(c => c.id === id);
    await this.collectionService.setActiveCollection(id);
    this.collections.filter(c => c.active).forEach(c => c.active = false);
    collection.active = true;
  }

  toggleManage() {
    this.managingMode = !this.managingMode;
  }

  async onItemClick(id): Promise<void> {
    if (this.managingMode) {
      await this.router.navigate(['new'], {
        relativeTo: this.activatedRoute,
        queryParams: {id}
      });
    } else {
      await this.setActive(id);
    }
  }

  private async loadCollections(): Promise<void> {
    const collections = (await this.collectionService.getCollections()).filter((c => c.status));
    this.collections = this.collectionService.sortCollections(collections);
  }
}
