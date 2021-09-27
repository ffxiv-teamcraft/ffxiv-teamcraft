import { Component } from '@angular/core';
import { TeamcraftComponent } from '../../core/component/teamcraft-component';
import { LazyDataService } from '../../core/data/lazy-data.service';
import { I18nName } from '../../model/common/i18n-name';

@Component({
  template: ''
})
export class ReportsManagementComponent extends TeamcraftComponent {

  protected readonly items: { id: number, name: I18nName }[] = [];
  protected readonly weathers: { id: number, name: I18nName }[] = [];
  protected readonly instances: { id: number, name: I18nName }[] = [];
  protected readonly ventures: { id: number, name: I18nName }[] = [];
  protected readonly submarineVoyages: { id: number, name: I18nName }[] = [];
  protected readonly airshipVoyages: { id: number, name: I18nName }[] = [];
  protected readonly mobs: { id: number, name: I18nName }[] = [];

  constructor(protected lazyData: LazyDataService) {
    super();
    const allItems = this.lazyData.allItems;
    this.items = Object.keys(this.lazyData.data.items)
      .filter(key => +key > 1)
      .map(key => {
        return {
          id: +key,
          name: allItems[key]
        };
      });

    this.weathers = Object.keys(this.lazyData.data.weathers)
      .map(key => {
        return {
          id: +key,
          name: this.lazyData.data.weathers[key].name
        };
      });

    this.instances = Object.keys(this.lazyData.data.instances)
      .map(key => {
        return {
          id: +key,
          name: this.lazyData.data.instances[key]
        };
      });

    this.ventures = Object.keys(this.lazyData.data.ventures)
      .map(key => {
        return {
          id: +key,
          name: this.lazyData.data.ventures[key]
        };
      });

    this.airshipVoyages = Object.keys(this.lazyData.data.airshipVoyages)
      .map(key => {
        return {
          id: +key,
          name: this.lazyData.data.airshipVoyages[key]
        };
      });

    this.submarineVoyages = Object.keys(this.lazyData.data.submarineVoyages)
      .map(key => {
        return {
          id: +key,
          name: this.lazyData.data.submarineVoyages[key]
        };
      });

    this.mobs = Object.keys(this.lazyData.data.mobs)
      .map(key => {
        return {
          id: +key,
          name: this.lazyData.data.mobs[key]
        };
      });
  }
}
