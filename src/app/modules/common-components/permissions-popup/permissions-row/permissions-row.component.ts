import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';
import {Permissions} from '../../../../core/database/permissions/permissions';
import {ObservableMedia} from '@angular/flex-layout';

@Component({
    selector: 'app-permissions-row',
    templateUrl: './permissions-row.component.html',
    styleUrls: ['./permissions-row.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PermissionsRowComponent {

    @Input()
    permissions: Permissions;

    @Output()
    permissionsChange: EventEmitter<Permissions> = new EventEmitter<Permissions>();

    @Output()
    delete: EventEmitter<void> = new EventEmitter<void>();

    @Input()
    avatar: string;

    @Input()
    fcCrest: [string, string, string];

    @Input()
    name: string;

    @Input()
    isEveryone = false;

    @Input()
    isAuthor = false;

    constructor(private media: ObservableMedia) {
    }

    /**
     * This one is here to handle if read is set to false, as it will disable the two other ones and set them to false.
     */
    public handleChanges(): void {
        // If you can't read, you can't participate nor write.
        if (this.permissions.read === false) {
            this.permissions.participate = false;
            this.permissions.write = false;
        }
        this.permissionsChange.emit(this.permissions);
    }

    isMobile(): boolean {
        return this.media.isActive('xs') || this.media.isActive('sm');
    }
}
