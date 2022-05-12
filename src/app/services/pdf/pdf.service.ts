import {Injectable} from '@angular/core';
import {Tag} from '../../classes/tag/tag';
import {Term} from '../../classes/term/term';
import {EmojiService} from '../emoji/emoji.service';
import {CollectionService} from '../collection/collection.service';
import {TagService} from '../tag/tag.service';

import {PDFGenerator} from '@awesome-cordova-plugins/pdf-generator';
import {HttpClient} from '@angular/common/http';
import {FileService} from '../fileService/file.service';
import {TranslateService} from '@ngx-translate/core';


@Injectable({
  providedIn: 'root'
})
export class PdfService {

  private header = `
  <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title></title>
  <style>
    body {
      text-align: center;
    }
    .title {
      font-family: 'Maiandra GD', sans-serif;
      margin: 4rem auto 3rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .tag-icon {
      width: 32px;
      margin-right: 12px;
    }
    .logo {
      width: 40vw;
    }
    .term {
      display: grid;
      grid-template-rows: repeat(6, max-content);
      gap: 6px 25px;
      align-items: baseline;
      justify-items: start;
      grid-template-areas:
          ". ."
          ". ."
          ". ."
          ". ."
          ". .";
      border: 1px solid #858585;
      border-radius: 4px;
      max-width: 65vw;
      min-width: 35vw;
      margin: 1rem auto;
      grid-auto-columns: 1fr;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      text-align: start;
      padding: 8px 8px 0;
      background-color: honeydew;
    }
    .label {
      white-space: nowrap;
    }
    @media print {
      .term {
        break-inside: avoid;
      }
    }
  </style>
</head>
<body>
`;
  private footer = `</body></html>`;

  constructor(
    private http: HttpClient,
    private emojiService: EmojiService,
    private collectionService: CollectionService,
    private tagService: TagService,
    private fileService: FileService,
    private translateService: TranslateService
  ) {
  }

  public async generatePDF(collectionId: number, tagId: number): Promise<void> {
    const collection = await this.collectionService.getCollectionById(collectionId);
    if (!collection) {
      throw new Error(`Collection with ID ${collectionId} not found`);
    }
    const tag = await this.tagService.getTagById(tagId, collectionId);
    if (!tag) {
      throw new Error(`Tag with ID ${tagId} not found`);
    }
    const terms = await this.tagService.getTermsFromTag(tag, collection);
    const html = await this.getHTML(collection.getLanguage().getName(), tag, terms);

    const data = await PDFGenerator.fromData(html, {
      documentSize: 'A4',
      type: 'base64'
    });
    await this.exportData(tag, data);
  }

  private async getHTML(collectionName: string, tag: Tag, terms: Term[]) {
    const tagIconData = await this.fileService.getBase64(this.emojiService.getEmojiRoute(tag.getIcon()));
    return `
    ${this.header}
    ${await this.renderTag(collectionName, tag.getName(), tagIconData)}
    ${terms.reduce((acc, t) => `${acc}${this.renderTerm(collectionName, t)}`, '')}
    ${this.footer}
    `;
  }

  private async renderTag(languageName: string, tagName: string, tagIconData: string) {
    const imgData = await this.fileService.getBase64('assets/img/logo.png');
    return `
<img class="logo" src="${imgData}" alt="Vocabulaire">
<h1 class="title"><img class="tag-icon" src="${tagIconData}" alt="">${tagName} - ${languageName}</h1>`;
  }

  private renderTerm(collectionName: string, term: Term) {
    const gcs = term.getGramaticalCategories().map(c => c.getName()).join(',');
    const tcs = term.getThematicCategories().map(c => c.getName()).join(',');
    return `
<div class="term ">
  <label class="language-label label">${collectionName}</label>
  <div class="original-term">${term.getOriginalTerm()}</div>
  <label class="translated-label label">${this.translateService.instant('pdf.translation')}:</label>
  <div class="translated-term">${term.getTranslatedTerm()}</div>
  <label class="grammatical-label label">${this.translateService.instant('data.category.gcs')}:</label>
  <div class="grammatical-categories">${gcs}</div>
  <label class="thematic-label label">${this.translateService.instant('data.category.tcs')}:</label>
  <div class="thematic-categories">${tcs}</div>
  <label class="notes-label label">${this.translateService.instant('data.term.notes')}:</label>
  <div class="notes">${term.getNotes()}</div>
</div>`;
  }

  private async exportData(tag: Tag, data: string) {
    const savedFile = await this.fileService.saveFileInCache(`vocabulaire_${tag.getName()}.pdf`, data);
    return this.fileService.shareFile(savedFile.uri, `Share ${tag.getName()} as PDF`);
  }
}
