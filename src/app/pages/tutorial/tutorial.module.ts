import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TutorialPageRoutingModule } from './tutorial-routing.module';

import { TutorialPage } from './tutorial.page';
import {SwiperModule} from 'swiper/angular';
import {EmojiPipeModule} from '../../pipes/emoji-pipe/emoji-pipe.module';
import {EmojiPickerModule} from '../../components/emoji-picker/emoji-picker.module';
import {TranslateModule} from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TutorialPageRoutingModule,
    SwiperModule,
    EmojiPipeModule,
    EmojiPickerModule,
    ReactiveFormsModule,
    TranslateModule
  ],
  declarations: [TutorialPage]
})
export class TutorialPageModule {}
