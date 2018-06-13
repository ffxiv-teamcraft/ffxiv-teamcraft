import {Component, EventEmitter, Input, Output} from '@angular/core';
import {CraftingRotation} from '../../../../model/other/crafting-rotation';
import {LinkToolsService} from '../../../../core/tools/link-tools.service';
import {MatSnackBar} from '@angular/material';
import {TranslateService} from '@ngx-translate/core';
import {CraftingAction} from '../../model/actions/crafting-action';
import {CraftingActionsRegistry} from '../../model/crafting-actions-registry';

@Component({
    selector: 'app-rotation-panel',
    templateUrl: './rotation-panel.component.html',
    styleUrls: ['./rotation-panel.component.scss']
})
export class RotationPanelComponent {

    @Input()
    rotation: CraftingRotation;

    @Output()
    editNameClick: EventEmitter<void> = new EventEmitter<void>();

    @Output()
    linkClick: EventEmitter<void> = new EventEmitter<void>();

    @Output()
    deleteClick: EventEmitter<void> = new EventEmitter<void>();

    @Input()
    linkButton = false;

    constructor(private linkTools: LinkToolsService, private snack: MatSnackBar, private translator: TranslateService,
                private craftingActionsRegistry: CraftingActionsRegistry) {
    }

    public getLink(rotation: CraftingRotation): string {
        return this.linkTools.getLink(this.getLocalLink(rotation));
    }

    public getLocalLink(rotation: CraftingRotation): string {
        let link = '/simulator';
        if (rotation.defaultItemId) {
            link += `/${rotation.defaultItemId}`;
            if (rotation.defaultRecipeId) {
                link += `/${rotation.defaultRecipeId}`;
            }
        } else {
            link += `/custom`;
        }
        return `${link}/${rotation.$key}`;
    }

    public getSteps(rotation: CraftingRotation): CraftingAction[] {
        return this.craftingActionsRegistry.deserializeRotation(rotation.rotation);
    }

    public showCopiedNotification(): void {
        this.snack.open(
            this.translator.instant('SIMULATOR.Share_link_copied'),
            '', {
                duration: 10000,
                panelClass: ['snack']
            });
    }

}
