import {Injectable} from '@angular/core';
import {Meta} from '@angular/platform-browser';
import {SeoConfig} from './seo-config';

@Injectable()
export class SeoService {

    constructor(private meta: Meta) {
    }

    public setConfig(config: SeoConfig): void {
        this.meta.updateTag({name: 'twitter:card', content: 'FFXIV Teamcraft'});
        this.meta.updateTag({name: 'twitter:site', content: '@FlavienNormand'});
        this.meta.updateTag({name: 'twitter:title', content: config.title});
        this.meta.updateTag({name: 'twitter:description', content: config.description});
        this.meta.updateTag({name: 'twitter:image', content: config.image});

        this.meta.updateTag({property: 'og:type', content: 'article'});
        this.meta.updateTag({property: 'og:site_name', content: 'AngularFirebase'});
        this.meta.updateTag({property: 'og:title', content: config.title});
        this.meta.updateTag({property: 'og:description', content: config.description});
        this.meta.updateTag({property: 'og:image', content: config.image});
        if (config.slug !== undefined) {
            this.meta.updateTag({property: 'og:url', content: `https://instafire-app.firebaseapp.com/${config.slug}`});
        }
    }
}
