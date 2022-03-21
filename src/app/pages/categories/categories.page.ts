import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Collection} from '../../classes/collection/collection';
import {CollectionService} from '../../services/collection/collection.service';
import {Category} from '../../classes/category/category';
import {AlertController} from '@ionic/angular';
import {CategoryType} from '../../classes/categoryType/category-type';
import {CategoryService} from '../../services/category/category.service';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.page.html',
  styleUrls: ['./categories.page.scss'],
})
export class CategoriesPage implements OnInit {

  title: string;
  categories: Category[];
  private collection: Collection;

  constructor(
    private activatedRoute: ActivatedRoute,
    private collectionService: CollectionService,
    private alertController: AlertController,
    private categoryService: CategoryService
  ) {
  }

  async ngOnInit() {
    this.title = this.activatedRoute.snapshot.paramMap.get('type');
    return this.refreshCategories();
  }

  newCategory() {
    return this.createAlert(
      `New ${this.title.toLowerCase()} category`,
      undefined,
      'Save',
      (text) => this.createCategory(text[0])
    );
  }


  editCategory(category: Category) {
    return this.createAlert(
      `Edit ${this.title.toLowerCase()} category`,
      category.getName(),
      'Update',
      (text) => this.updateCategory(text[0], category)
    );
  }

  async deleteCategory(category: Category): Promise<void> {
    await this.categoryService.deleteCategory(this.collection.getId(), category.getId());
    await this.refreshCategories();
  }

  private async createAlert(title: string, value: string, buttonText: string, handler) {
    const alert = await this.alertController.create({
      header: title,
      inputs: [{
        value,
        placeholder: 'Category name'
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
      category = new Category(name, new CategoryType('gramatical'));
      return this.categoryService.addCategory(category, this.collection.getId());
    } else {
      category = new Category(name, new CategoryType('thematic'));
      return this.categoryService.addCategory(category, this.collection.getId());
    }
  }

  private updateCategory(name: string, category: Category): Promise<Category> {
    return this.categoryService.updateCategory(name, this.collection.getId(), category.getId());
  }

  private isGramaticalMode() {
    return this.title === 'Gramatical';
  }

  private async refreshCategories() {
    this.collection = await this.collectionService.getActiveCollection();
    this.categories = this.isGramaticalMode() ? this.collection.getGramaticalCategories() : this.collection.getThematicCategories();
  }

}
