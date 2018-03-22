import {Injectable, TemplateRef} from '@angular/core';
import {ComponentType} from '@angular/cdk/portal';
import {NavigationEnd, Router} from '@angular/router';

@Injectable()
export class HelpService {

    private _helps: { [index: string]: ComponentType<any> | TemplateRef<any> } = {};

    private currentRoute: string;

    constructor(private router: Router) {
        router.events
            .filter(event => event instanceof NavigationEnd)
            .subscribe((event: any) => {
                this.currentRoute = event.url;
                if (this.currentRoute.indexOf('/list') > -1) {
                    this.currentRoute = '/list';
                }
            });
    }

    public set currentHelp(dialog: ComponentType<any> | TemplateRef<any>) {
        this._helps[this.currentRoute] = dialog;
    }

    public get currentHelp(): ComponentType<any> | TemplateRef<any> {
        return this._helps[this.currentRoute];
    }
}
