import {Component, OnInit, ViewChild} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {CollectionService} from '../../services/collection/collection.service';
import {Collection} from '../../classes/collection/collection';
import {AlertController, IonSelect, NavController, ToastController} from '@ionic/angular';
import {Category} from '../../classes/category/category';
import {Term} from '../../classes/term/term';
import {TermService} from '../../services/term/term.service';
import {ActivatedRoute} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-term',
  templateUrl: './term.page.html',
  styleUrls: ['./term.page.scss'],
})
export class TermPage implements OnInit {
  @ViewChild('gramaticalCategoriesDropdown') gramaticalCategoriesDropdown: IonSelect;
  @ViewChild('thematicCategoriesDropdown') thematicCategoriesDropdown: IonSelect;
  title: string;
  readonly maxTermNameLength: number = 25;
  readonly maxNotesLength: number = 400;
  termForm: FormGroup;
  validationMessages = {
    originalTerm: [
      {type: 'required', message: 'Original term is required'},
      {type: 'maxlength', message: `Translated term must have less than ${this.maxTermNameLength} characters`}
    ],
    translatedTerm: [
      {type: 'required', message: 'Translated term is required'},
      {type: 'maxlength', message: `Original term must have less than ${this.maxTermNameLength} characters`}
    ],
    gramaticalCategories: [],
    thematicCategories: [],
    notes: [{type: 'maxlength', message: `Notes must have less than ${this.maxNotesLength} characters`}]
  };
  customAlertOptions: any;
  languageLabel: string;
  gramaticalCategoriesList: Category[];
  thematicCategoriesList: Category[];

  selectedGramaticalCategories: Category[];
  selectedThematicCategories: Category[];

  editingID: number;

  showLength = {originalTerm: false, translatedTerm: false, notes: false};

  translation = {
    form: {
      translatedTerm: 'term.form.tr',
      notes:'data.term.notes'
    }
  };

  compareWith = compareCategories;

  private activeCollection: Collection;
  private toast: HTMLIonToastElement;

  constructor(
    private collectionService: CollectionService,
    private termService: TermService,
    private navController: NavController,
    private activatedRoute: ActivatedRoute,
    private alertController: AlertController,
    private translateService: TranslateService,
    private toastController: ToastController
  ) {
    this.termForm = new FormGroup({
      originalTerm: new FormControl('', Validators.compose([Validators.required, Validators.maxLength(this.maxTermNameLength)])),
      translatedTerm: new FormControl('', Validators.compose([Validators.required, Validators.maxLength(this.maxTermNameLength)])),
      gramaticalCategories: new FormControl(''),
      thematicCategories: new FormControl(''),
      notes: new FormControl('', Validators.maxLength(this.maxNotesLength)),
    });

    this.customAlertOptions = {
      header: 'Gramatical categories',
      translucent: true,
    };
    this.selectedGramaticalCategories = [];
    this.selectedThematicCategories = [];
  }

  async ngOnInit() {
    const id: string = this.activatedRoute.snapshot.paramMap.get('id');
    if (id) {
      this.editingID = +id;
    }
    if (this.editingID) {
      this.title = await this.translateService.get('term.title-edit').toPromise();
    } else {
      this.title = await this.translateService.get('term.title-new').toPromise();
    }
  }

  async ionViewWillEnter() {
    this.activeCollection = await this.collectionService.getActiveCollection();
    this.languageLabel = this.activeCollection.getLanguage().getName();
    this.gramaticalCategoriesList = this.activeCollection.getGramaticalCategories();
    this.thematicCategoriesList = this.activeCollection.getThematicCategories();

    if (this.editingID) {
      await this.editingMode();
    }
  }

  async onSubmit(): Promise<void> {
    if (this.termForm.valid) {
      const {
        originalTerm,
        translatedTerm,
        gramaticalCategories,
        thematicCategories,
        notes
      } = this.termForm.getRawValue();
      const term = new Term(originalTerm, translatedTerm, notes);
      term.addGramaticalCategories(gramaticalCategories);
      term.addThematicCategories(thematicCategories);

      await this.toast?.dismiss();
      if (this.editingID) {
        try {
          await this.termService.updateTerm(this.editingID, term, this.activeCollection.getId());
          this.toast = await this.toastController.create({
            message: 'Term updated successfully',
            icon: 'chatbox',
            color: 'success',
            duration: 800,
          });
        } catch (_) {
        }
      } else {
        try {
          await this.termService.addTerm(term, this.activeCollection.getId());
          this.toast = await this.toastController.create({
            message: 'Term created successfully',
            icon: 'chatbox',
            color: 'success',
            duration: 800,
          });
        } catch (error) {
          this.toast = await this.toastController.create({
            header: 'Error when creating term',
            message: 'Active collection not found',
            icon: 'chatbox',
            color: 'danger',
            duration: 1000,
          });
          return this.toast.present();
        }
      }
      await Promise.allSettled([this.toast.present(), this.navController.navigateBack('')]);
    } else {
      this.termForm.markAllAsTouched();
    }
  }

  async openDeletionAlert(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Confirm deletion',
      message: 'This action cannot be undone',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        }, {
          text: 'Delete',
          handler: async () => {
            await this.toast?.dismiss();
            try {
              await this.termService.deleteTerm(this.editingID, this.activeCollection.getId());
              this.toast = await this.toastController.create({
                message: 'Term deleted successfully',
                icon: 'chatbox',
                color: 'success',
                duration: 800
              });
              await Promise.allSettled([this.toast.present(), await this.navController.navigateBack('')]);
            } catch (_) {
              this.toast = await this.toastController.create({
                header: 'Error when deleting term',
                message: 'Active collection not found',
                icon: 'chatbox',
                color: 'danger',
                duration: 1000
              });
            }
          }
        }
      ]
    });

    await alert.present();
  }

  updateChips(event, type: number) {
    switch (type) {
      case 0:
        this.selectedGramaticalCategories = event.detail.value;
        break;
      case 1:
        this.selectedThematicCategories = event.detail.value;
        break;
    }
  }

  async navigateToCategories(type) {
    await this.navController.navigateForward(`categories/${type}`);
  }

  inputOnFocus(formControlName: string): void {
    this.showLength[formControlName] = true;
  }

  inputOnBlur(formControlName: string): void {
    this.showLength[formControlName] = false;
  }

  private async editingMode() {
    const term = this.activeCollection.getTerms().find(t => t.getId() === this.editingID);
    this.termForm.patchValue({
      originalTerm: term.getOriginalTerm(),
      translatedTerm: term.getTranslatedTerm(),
      gramaticalCategories: term.getGramaticalCategories(),
      thematicCategories: term.getThematicCategories(),
      notes: term.getNotes()
    });
  }
}

const compareCategories = (c1: Category, c2) => {
  if (Array.isArray(c2)) {
    if (!c1 || !c1.getId()) {
      return false;
    }
    return c2.find(val => val && val.getId() === c1.getId());
  }
  return c1 && c2 ? c1.getId() === c2.getId() : c1 === c2;
};
