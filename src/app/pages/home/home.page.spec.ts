import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {HomePage} from './home.page';
import {Term} from '../../classes/term/term';
import {Category} from '../../classes/category/category';
import {CategoryType} from '../../enums/enums';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {AbstractStorageService} from '../../services/storage/abstract-storage-service';
import {MockStorageService} from '../../services/storage/mock-storage.service';
import {Collection} from '../../classes/collection/collection';
import {Emoji} from '../../classes/emoji/emoji';
import {CollectionService} from '../../services/collection/collection.service';
import {RouterTestingModule} from '@angular/router/testing';
import {AlertController, NavController} from '@ionic/angular';
import {MockAlertController, MockNavController} from '../../../mocks';
import {TermService} from '../../services/term/term.service';
import {EmojisMap} from '../../services/emoji/emojisMap';

describe('HomePage', () => {
  let component: HomePage;
  let fixture: ComponentFixture<HomePage>;

  let collection: Collection;
  let collectionService: CollectionService;
  let termService: TermService;

  const categoryType1: CategoryType = CategoryType.gramatical;
  const categoryType2: CategoryType = CategoryType.thematic;

  const gramaticalCategory: Category = new Category('Sustantivo', categoryType1);
  gramaticalCategory.setId(1);

  const thematicCategory: Category = new Category('Cuerpo', categoryType2);
  thematicCategory.setId(1);

  const term1: Term = new Term('Mano', 'Hand', 'No confundir con manecilla de reloj');
  term1.addGramaticalCategory(gramaticalCategory);
  term1.addThematicCategory(thematicCategory);
  term1.setId(1);

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [HomePage],
      imports: [RouterTestingModule.withRoutes([])],
      providers: [
        {provide: AbstractStorageService, useClass: MockStorageService},
        {provide: NavController, useClass: MockNavController},
        {provide: EmojisMap},
        {provide: AlertController, useClass: MockAlertController}
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    collectionService = TestBed.inject(CollectionService);
    termService = TestBed.inject(TermService);
  }));

  beforeEach(waitForAsync(() => {
    collection = new Collection('English', 'EN', new Emoji('flags', 'uk'));
    initialize();
  }));

  const initialize = (): Promise<void> => new Promise(res => {
    collectionService.addCollection(collection).then((c) => {
      collectionService.setActiveCollection(c.getId()).then(cActive => {
        collection = cActive;
        fixture = TestBed.createComponent(HomePage);
        component = fixture.componentInstance;
        fixture.detectChanges();
        res();
      });
    });
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display logo in header', () => {
    const logo = fixture.debugElement.query(By.css('.header .header-logo'));
    expect(logo.nativeElement.localName).toBe('ion-img');
  });

  it('should display menu in header', () => {
    expect(fixture.debugElement.query(By.css('.header ion-menu-button'))).toBeTruthy();
  });

  it('should display language icon', () => {
    const buttons = fixture.debugElement.query(By.css('.header ion-buttons[slot=end]'));
    expect(buttons).toBeTruthy();
  });

  it('should contains searchbar', () => {
    expect(fixture.debugElement.query(By.css('ion-searchbar'))).toBeTruthy();
  });

  it('should contains book button', () => {
    expect(fixture.debugElement.query(By.css('.book-button'))).toBeTruthy();
  });

  describe('Search options', () => {
    it('should contains filter button', () => {
      expect(fixture.debugElement.query(By.css('.filter-button'))).toBeTruthy();
    });

    it('should contains sorting button', () => {
      expect(fixture.debugElement.query(By.css('.sort-button'))).toBeTruthy();
    });

    it('should contains details toggle', () => {
      const toggle = fixture.debugElement.query(By.css('.details-toggle ion-toggle'));
      expect(toggle).toBeTruthy();
      // expect(toggle.attributes['aria-checked']).toBeTruthy();
    });
  });

  it('should contains add button', () => {
    expect(fixture.debugElement.query(By.css('.add-term'))).toBeTruthy();
  });

  it('should contains terms', () => {
    component.terms = [];
    expect(fixture.debugElement.queryAll(By.css('.term')).length).toBe(component.terms.length);
    expect(fixture.debugElement.query(By.css('.no-terms-message'))).toBeTruthy();
    component.terms = [term1];
    fixture.detectChanges();
    const DOM_TERMS = fixture.debugElement.queryAll(By.css('.term'));
    expect(DOM_TERMS.length).toBe(component.terms.length);
    expect(fixture.debugElement.query(By.css('.no-terms-message'))).toBeFalsy();
    expect(DOM_TERMS[0].query(By.css('.term-name')).nativeElement.innerText).toBe(term1.getOriginalTerm());
    expect(DOM_TERMS[0].query(By.css('.translated-term')).nativeElement.innerText).toBe(term1.getTranslatedTerm());
    expect(DOM_TERMS[0].query(By.css('.term-note')).nativeElement.innerText).toBe(term1.getNotes());
    expect(DOM_TERMS[0].queryAll(By.css('.categories .gramatical-category')).length).toBe(term1.getGramaticalCategories().length);
    expect(DOM_TERMS[0].queryAll(By.css('.categories .thematic-category')).length).toBe(term1.getThematicCategories().length);
  });

  it('should navigate to collections', async () => {
    const navCtrl = fixture.debugElement.injector.get(NavController);
    spyOn(navCtrl, 'navigateForward');
    await component.navigateToCollections();
    expect(navCtrl.navigateForward).toHaveBeenCalledWith('collections');
  });

  it('should navigate to new term', async () => {
    const navCtrl = fixture.debugElement.injector.get(NavController);
    spyOn(navCtrl, 'navigateForward');
    await component.navigateToTerm();
    expect(navCtrl.navigateForward).toHaveBeenCalledWith('term/new');
  });

  it('should navigate to existing term', async () => {
    const navCtrl = fixture.debugElement.injector.get(NavController);
    spyOn(navCtrl, 'navigateForward');
    await component.navigateToTerm(1);
    expect(navCtrl.navigateForward).toHaveBeenCalledWith('term/1');
  });

  it('should init view', async () => {
    spyOn(collectionService, 'getActiveCollection').and.resolveTo(collection);
    spyOn(Collection.prototype, 'getTerms').and.returnValue([]);
    await component.ionViewWillEnter();
    expect(collectionService.getActiveCollection).toHaveBeenCalled();
    expect(Collection.prototype.getTerms).toHaveBeenCalled();
  });

  it('should sort terms', () => {
    const t1 = new Term('bb', 'xx');
    const t2 = new Term('cc', 'yy');
    const t3 = new Term('aa', 'zz');
    t2.updateUpdatedTime(10000);
    t3.updateUpdatedTime(20000);
    t1.updateUpdatedTime(30000);
    component.terms = [t1, t2, t3];

    component.sort(1);
    expect(component.terms).toEqual([t3, t1, t2]);
    component.sort(1);
    expect(component.terms).toEqual([t2, t1, t3]);

    component.sort(2);
    expect(component.terms).toEqual([t1, t2, t3]);
    component.sort(2);
    expect(component.terms).toEqual([t3, t2, t1]);

    component.sort(3);
    expect(component.terms).toEqual([t1, t3, t2]);
    component.sort(3);
    expect(component.terms).toEqual([t2, t3, t1]);
  });

  it('should present filter alert', async () => {
    component.activeCollection = new Collection('French', 'FR', new Emoji('fr.png', 'flags'));
    component.activeCollection.addGramaticalCategory(new Category('Body', CategoryType.thematic));
    const alertController = fixture.debugElement.injector.get(AlertController);
    spyOn(alertController, 'create').and.callThrough();
    await component.presentAlertCheckbox(0);
    expect(alertController.create).toHaveBeenCalled();
    await component.presentAlertCheckbox(1);
    expect(alertController.create).toHaveBeenCalledTimes(2);
  });

  it('should filter searchbar', () => {
    const t1 = new Term('bb', 'xx', 'bx');
    const t2 = new Term('cc', 'yy', 'cy');
    const t3 = new Term('aá', 'zz', 'açz');
    component.activeCollection = new Collection('French', 'FR', new Emoji('fr.png', 'flags'));
    component.activeCollection.addTerms([t1, t2, t3]);
    const event = {target: {value: 'ç'}};
    component.handleSearchbar(event);
    expect(component.terms).toEqual([t3]);
  });

  it('should filter filters', () => {
    component.activeCollection = new Collection('French', 'FR', new Emoji('fr.png', 'flags'));
    const t1 = new Term('bb', 'xx', 'bx');
    const t2 = new Term('cc', 'yy', 'cy');
    const gc = new Category('Noun', CategoryType.gramatical);
    const tc = new Category('Noun', CategoryType.thematic);
    component.activeCollection.addGramaticalCategory(gc);
    component.activeCollection.addThematicCategory(tc);
    t1.addGramaticalCategory(gc);
    t2.addThematicCategory(tc);
    component.activeCollection.addTerms([t1, t2]);

    const event = {target: {value: ''}};
    component.handleSearchbar(event);
    expect(component.terms).toEqual([t1, t2]);
  });
});
