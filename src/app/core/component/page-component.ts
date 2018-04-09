import {ComponentWithSubscriptions} from './component-with-subscriptions';
import {TemplateRef} from '@angular/core/src/core';
import {ComponentType} from '@angular/cdk/portal';
import {OnInit} from '@angular/core';
import {MatDialog} from '@angular/material';
import {HelpService} from './help.service';
import {ObservableMedia} from '@angular/flex-layout';

/**
 * This is the component every page component (which needs a help dialog) should implement.
 *
 * to implement it, simply extend this component, don't forget the "super()" call in constructor.
 *
 * Then you have to call super.ngOnInit() in your component's ngOnInit if it already has one.
 */
export abstract class PageComponent extends ComponentWithSubscriptions implements OnInit {

    constructor(protected dialog: MatDialog, protected helpService: HelpService, protected media: ObservableMedia) {
        super();
    }

    /**
     * This method is supposed to give the help dialog to display when the user asks for help or on the first visit.
     * @returns {ComponentType<any> | TemplateRef<any>} A dialog component to display to the user.
     */
    abstract getHelpDialog(): ComponentType<any> | TemplateRef<any>;

    /**
     * On Init, check if dialog has already been opened, if not, open it and add informations to the localstorage that it has been opened.
     */
    public ngOnInit(): void {
        this.helpService.currentHelp = this.getHelpDialog();
    }
}
