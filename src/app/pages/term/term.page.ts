import {Component, OnInit, ViewChild} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {CollectionService} from '../../services/collection/collection.service';
import {Collection} from '../../classes/collection/collection';
import {IonSelect, NavController} from '@ionic/angular';
import {Category} from '../../classes/category/category';
import {Term} from '../../classes/term/term';
import {TermService} from '../../services/term/term.service';

@Component({
  selector: 'app-term',
  templateUrl: './term.page.html',
  styleUrls: ['./term.page.scss'],
})
export class TermPage implements OnInit {
  @ViewChild('gramaticalCategoriesDropdown') gramaticalCategoriesDropdown: IonSelect;
  @ViewChild('thematicCategoriesDropdown') thematicCategoriesDropdown: IonSelect;
  title: string;
  termForm: FormGroup;
  editingId: number;
  customAlertOptions: any;
  languageLabel: string;
  gramaticalCategoriesList: Category[];
  thematicCategoriesList: Category[];

  selectedGramaticalCategories: Category[];
  selectedThematicCategories: Category[];

  private activeCollection: Collection;

  constructor(
    private collectionService: CollectionService,
    private termService: TermService,
    private navController: NavController
  ) {
    this.termForm = new FormGroup({
      originalTerm: new FormControl('', Validators.required),
      translatedTerm: new FormControl('', Validators.required),
      gramaticalCategories: new FormControl(''),
      thematicCategories: new FormControl(''),
      notes: new FormControl(''),
    });
    this.customAlertOptions = {
      header: 'Gramatical categories',
      translucent: true,
    };
    this.selectedGramaticalCategories = [];
    this.selectedThematicCategories = [];
  }

  async ngOnInit() {
    this.title = 'New term';
    this.activeCollection = await this.collectionService.getActiveCollection();
    this.languageLabel = this.activeCollection.getLanguage().getName();
    this.gramaticalCategoriesList = this.activeCollection.getGramaticalCategories();
    this.thematicCategoriesList = this.activeCollection.getThematicCategories();
  }

  async onSubmit() {
    const {originalTerm, translatedTerm, gramaticalCategories, thematicCategories, notes} = this.termForm.getRawValue();
    const term = new Term(originalTerm, translatedTerm, notes);
    term.addGramaticalCategories(gramaticalCategories);
    term.addThematicCategories(thematicCategories);

    await this.termService.addTerm(term, this.activeCollection.getId());
    await this.navController.navigateBack('home');
  }

  openDeletionAlert() {
    //TODO implement edit mode
    console.log('delete');
  }

  updateChips(event: CustomEvent, type: number) {
    switch (type) {
      case 0:
        this.selectedGramaticalCategories = event.detail.value;
        break;
      case 1:
        this.selectedThematicCategories = event.detail.value;
        break;
    }
  }

}
