import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

import {IonicModule} from '@ionic/angular';

import {CategoriesPageRoutingModule} from './categories-routing.module';

import {CategoriesPage} from './categories.page';

import {TranslateModule} from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CategoriesPageRoutingModule,
    TranslateModule
  ],
  declarations: [CategoriesPage]
})
export class CategoriesPageModule {
}
