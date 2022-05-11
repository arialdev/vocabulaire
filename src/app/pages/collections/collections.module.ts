import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

import {IonicModule} from '@ionic/angular';

import {CollectionsPageRoutingModule} from './collections-routing.module';

import {CollectionsPage} from './collections.page';
import {TranslateModule} from '@ngx-translate/core';
import {EmojiPipeModule} from '../../pipes/emoji-pipe/emoji-pipe.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CollectionsPageRoutingModule,
    TranslateModule,
    EmojiPipeModule
  ],
  declarations: [CollectionsPage]
})
export class CollectionsPageModule {
}
