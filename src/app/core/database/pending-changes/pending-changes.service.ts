import {Injectable} from '@angular/core';

@Injectable()
export class PendingChangesService {

    public pendingChanges: string[] = [];

    public hasPendingChanges(): boolean {
        return this.pendingChanges.length > 0;
    }

    public addPendingChange(id: string): void {
        this.pendingChanges.push(id);
    }

    public removePendingChange(id: string): void {
        this.pendingChanges = this.pendingChanges.filter(row => row !== id);
    }
}
