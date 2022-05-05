import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

import {IonicModule} from '@ionic/angular';

import {MenuPageRoutingModule} from './menu-routing.module';

import {MenuPage} from './menu.page';
import {EmojiPipeModule} from '../../pipes/emoji-pipe/emoji-pipe.module';
import {TranslateModule} from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MenuPageRoutingModule,
    EmojiPipeModule,
    TranslateModule
  ],
  exports: [
    MenuPage
  ],
  declarations: [MenuPage]
})
export class MenuPageModule {
}
