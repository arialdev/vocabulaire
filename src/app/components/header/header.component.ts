import {Component, OnInit} from '@angular/core';
import {NavController} from '@ionic/angular';
import {Emoji} from '../../classes/emoji/emoji';
import {CollectionService} from '../../services/collection/collection.service';
import {EmojiService} from '../../services/emoji/emoji.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {

  public collectionIcon: string;

  constructor(
    private collectionService: CollectionService,
    private navController: NavController,
    private emojiService: EmojiService) {
  }

  async ngOnInit() {
    await this.collectionService.getActiveCollection();
    this.collectionService.currentActiveCollection.subscribe(activeCollection => {
      const emoji: Emoji = activeCollection.getLanguage().getIcon();
      this.collectionIcon = this.emojiService.getEmojiRoute(emoji);
    });
  }

  async navigateToCollections(): Promise<void> {
    await this.navController.navigateForward('collections');
  }

}
