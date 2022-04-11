import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Collection} from '../../classes/collection/collection';
import {CollectionService} from '../../services/collection/collection.service';
import {Category} from '../../classes/category/category';
import {AlertController} from '@ionic/angular';
import {CategoryService} from '../../services/category/category.service';
import {CategoryType} from '../../enums/enums';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.page.html',
  styleUrls: ['./categories.page.scss'],
})
export class CategoriesPage implements OnInit {

  title: string;
  categories: Category[];
  searchbarPlaceholder: string;
  private collection: Collection;
  private type: number;

  constructor(
    private activatedRoute: ActivatedRoute,
    private collectionService: CollectionService,
    private alertController: AlertController,
    private categoryService: CategoryService,
    private translateService: TranslateService
  ) {
  }

  async ngOnInit() {
    this.type = +this.activatedRoute.snapshot.params.type;
    await this.translate();
    return this.refreshCategories();
  }

  async newCategory() {
    const type = (await this.translateService
      .get('data.category.type.' + (this.isGramaticalMode() ? 'g' : 't'))
      .toPromise())
      .toLowerCase();
    return this.createAlert(
      await this.translateService.get('category.alert.header.create', {type}).toPromise(),
      undefined,
      'Save',
      (text) => this.createCategory(text[0])
    );
  }


  async editCategory(category: Category) {
    const type = (await this.translateService
      .get('data.category.type.' + (this.isGramaticalMode() ? 'g' : 't'))
      .toPromise())
      .toLowerCase();
    return this.createAlert(
      await this.translateService.get('category.alert.header.edit', {type}).toPromise(),
      category.getName(),
      'Update',
      (text) => this.updateCategory(text[0], category)
    );
  }

  async deleteCategory(category: Category): Promise<void> {
    await this.categoryService.deleteCategory(this.collection.getId(), category.getId(), category.getType());
    await this.refreshCategories();
  }

  private async createAlert(title: string, value: string, buttonText: string, handler) {
    const alert = await this.alertController.create({
      header: title,
      inputs: [{
        value,
        placeholder: await this.translateService.get('category.alert.placeholder').toPromise()
      }],
      backdropDismiss: true,
      translucent: true,
      animated: true,
      keyboardClose: true,
      buttons: [
        {text: 'Cancel', role: 'cancel'},
        {
          text: buttonText, role: 'set', handler: async (t) => {
            await handler(t);
            await this.refreshCategories();
          }
        }
      ]
    });
    return alert.present();
  }

  private createCategory(name: string): Promise<Category> {
    let category: Category;
    if (this.isGramaticalMode()) {
      category = new Category(name, CategoryType.gramatical);
      return this.categoryService.addCategory(category, this.collection.getId());
    } else {
      category = new Category(name, CategoryType.thematic);
      return this.categoryService.addCategory(category, this.collection.getId());
    }
  }

  private updateCategory(name: string, category: Category): Promise<Category> {
    return this.categoryService.updateCategory(name, this.collection.getId(), category.getId());
  }

  private isGramaticalMode() {
    return this.type === 0;
  }

  private async refreshCategories() {
    this.collection = await this.collectionService.getActiveCollection();
    this.categories = this.isGramaticalMode() ? this.collection.getGramaticalCategories() : this.collection.getThematicCategories();
  }

  private async translate() {
    this.title = await this.translateService.get('data.category.' + (this.isGramaticalMode() ? 'gcs' : 'tcs')).toPromise();
    this.searchbarPlaceholder = await this.translateService.get('category.searchbar-placeholder').toPromise();
  }
}
