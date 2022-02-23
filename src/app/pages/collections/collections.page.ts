import {Component, OnInit} from '@angular/core';
import {Collection} from '../../interfaces/collection';
import {CollectionService} from '../../services/collection/collection.service';

@Component({
  selector: 'app-collections',
  templateUrl: './collections.page.html',
  styleUrls: ['./collections.page.scss'],
})
export class CollectionsPage implements OnInit {

  public collections: Collection [];

  constructor(private collectionService: CollectionService) {
    this.collections = [];
  }

  async ngOnInit() {
    await this.getCollections();
  }

  async setActive(id) {
    await this.collectionService.setActiveCollection(id);
    await this.getCollections();
  }

  private async getCollections() {
    this.collections = await this.collectionService.getCollections();
    this.collections.sort((c) => c.active ? -1 : 1);
  }
}
