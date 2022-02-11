import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {IonicModule} from '@ionic/angular';
import {By} from '@angular/platform-browser';

import {HomePage} from './home.page';

describe('HomePage', () => {
  let component: HomePage;
  let fixture: ComponentFixture<HomePage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [HomePage],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(HomePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

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
    const buttonLink = buttons.query(By.css('ion-button'));
    expect(buttonLink.nativeElement.href).toBe('/folder/languages');
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
      expect(toggle.attributes['aria-checked']).toBeTruthy();
    });
  });

  it('should contains add button', () => {
    expect(fixture.debugElement.query(By.css('.add-term'))).toBeTruthy();
  });
});
