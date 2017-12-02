import {OnDestroy} from '@angular/core';
import {Subscription} from 'rxjs/Subscription';

export abstract class ComponentWithSubscriptions implements OnDestroy {
    protected subscriptions: Subscription[] = [];

    ngOnDestroy(): void {
        this.subscriptions.forEach(sub => sub.unsubscribe());
    }
}
