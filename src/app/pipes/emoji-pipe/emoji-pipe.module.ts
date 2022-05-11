import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {EmojiPipe} from './emoji.pipe';


@NgModule({
  declarations: [EmojiPipe],
  imports: [
    CommonModule
  ],
  exports: [EmojiPipe]
})
export class EmojiPipeModule {
}
