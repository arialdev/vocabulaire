import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {HeaderComponent} from './header.component';
import {IonicModule} from '@ionic/angular';
import {EmojiPipeModule} from '../../pipes/emoji-pipe/emoji-pipe.module';


@NgModule({
  declarations: [HeaderComponent],
  imports: [
    CommonModule,
    IonicModule,
    EmojiPipeModule
  ],
  exports: [HeaderComponent]
})
export class HeaderModule {
}
