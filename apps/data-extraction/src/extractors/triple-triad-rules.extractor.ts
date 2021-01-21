import { AbstractExtractor } from '../abstract-extractor';

export class TripleTriadRulesExtractor extends AbstractExtractor {
  protected doExtract(): any {
    const rules = {};
    this.getAllPages('https://xivapi.com/TripleTriadRule?columns=ID,Name_*').subscribe(page => {
      page.Results.forEach(rule => {
        rules[rule.ID] = {
          name: {
            en: rule.Name_en,
            ja: rule.Name_ja,
            de: rule.Name_de,
            fr: rule.Name_fr
          }
        };
      });
    }, null, () => {
      this.persistToTypescript('triple-triad-rules', 'tripleTriadRules', rules);
      this.done();
    });
  }

  getName(): string {
    return 'triple-triad-rules';
  }

}
