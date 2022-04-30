import {Injectable} from '@angular/core';
import {Share, ShareResult} from '@capacitor/share';
import {Directory, Encoding, Filesystem, WriteFileResult} from '@capacitor/filesystem';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class FileService {

  constructor(private http: HttpClient) {
  }

  public async shareFile(fileURI: string, text: string, dialogTitle?: string, title?: string): Promise<ShareResult> {
    if (!(await Share.canShare())) {
      throw new Error('Device does not support sharing');
    }
    return Share.share({
      dialogTitle: dialogTitle ?? 'Export tag pdf',
      title: title ?? 'Share pdf',
      url: fileURI,
      text
    });
  }

  public async saveFileInCache(path: string, data: string, encoding?: Encoding | undefined): Promise<WriteFileResult> {
    return Filesystem.writeFile({
      path,
      data,
      directory: Directory.Cache,
      encoding
    });
  }

  public async getBase64(resourceRoute: string): Promise<string> {
    return new Promise<string>(async resolve =>
      this.http.get(resourceRoute, {responseType: 'blob'}).subscribe(res => {
          const reader = new FileReader();
          resolve(new Promise<string>(async resolve2 => {
            reader.onloadend = async () => {
              if (typeof reader.result !== 'string') {
                const blob = new Blob([reader.result], {type: 'text/plain; charset=utf-8'});
                resolve2(blob.text());
              } else {
                resolve(reader.result);
              }
            };
            reader.readAsDataURL(res);
          }));
        }
      )
    );
  }
}
