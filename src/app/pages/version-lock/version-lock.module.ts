import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VersionLockComponent } from './version-lock/version-lock.component';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [{
    path: 'version-lock',
    component: VersionLockComponent
}];

@NgModule({
    imports: [
        CommonModule,

        RouterModule.forChild(routes),
    ],
    declarations: [
        VersionLockComponent
    ]
})
export class VersionLockModule {
}
