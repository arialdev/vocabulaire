import {Component, OnInit} from '@angular/core';
import {NavController} from '@ionic/angular';
import {Emoji} from '../../classes/emoji/emoji';
import {CollectionService} from '../../services/collection/collection.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {

  public collectionIcon: Emoji;

  constructor(
    private collectionService: CollectionService,
    private navController: NavController) {
  }

  async ngOnInit() {
    await this.collectionService.getActiveCollection();
    this.collectionService.currentActiveCollection.subscribe(activeCollection => {
      this.collectionIcon = activeCollection.getLanguage().getIcon();
    });
  }

  async navigateToCollections(): Promise<void> {
    await this.navController.navigateForward('collections');
  }

}
