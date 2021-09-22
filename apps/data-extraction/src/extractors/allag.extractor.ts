import { AbstractExtractor } from '../abstract-extractor';

export class AllagExtractor extends AbstractExtractor {

  protected doExtract(): any {
    this.gubalRequest(`query AllagData {
      allagan_reports {
        itemId,
        source,
        data
      }
    }`).subscribe(res => {
      this.done();
    });
  }

  getName(): string {
    return 'allag';
  }

}
