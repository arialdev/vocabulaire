import {Component} from '@angular/core';
import {Collection} from '../../interfaces/collection';
import {CollectionService} from '../../services/collection/collection.service';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
  selector: 'app-collections',
  templateUrl: './collections.page.html',
  styleUrls: ['./collections.page.scss'],
})
export class CollectionsPage {

  public collections: Collection [];
  public managementStatus: boolean;

  constructor(
    private collectionService: CollectionService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) {
    this.collections = [];
    this.managementStatus = false;
  }

  async ionViewWillEnter() {
    await this.getCollections();
    this.managementStatus = false;
  }

  async setActive(id) {
    await this.collectionService.setActiveCollection(id);
    await this.getCollections();
  }

  toggleManage() {
    this.managementStatus = !this.managementStatus;
  }

  onItemClick(id) {
    if (this.managementStatus) {
      this.router.navigate(['new'], {
        relativeTo: this.activatedRoute,
        queryParams: {id}
      });
    } else {
      this.setActive(id);
    }
  }

  private async getCollections() {
    this.collections = await this.collectionService.getCollections();
    this.collections.sort((c) => c.active ? -1 : 1);
  }
}
