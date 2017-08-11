import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MdCardModule, MdIconModule, MdInputModule, MdListModule, MdPaginatorModule } from '@angular/material';
import { HttpClientModule } from '@angular/common/http';
import { RecipesComponent } from './recipes/recipes.component';

@NgModule({
    declarations: [
        AppComponent,
        RecipesComponent,
    ],
    imports: [
        HttpClientModule,
        // Animations for material.
        BrowserAnimationsModule,

        MdCardModule,
        MdIconModule,
        MdListModule,
        MdPaginatorModule,
        MdInputModule,

        BrowserModule,
        FormsModule,
        HttpModule
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}
