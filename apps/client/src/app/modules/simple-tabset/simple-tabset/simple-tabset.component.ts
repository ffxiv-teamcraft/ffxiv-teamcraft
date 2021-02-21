import { AfterContentInit, ChangeDetectionStrategy, Component, ContentChildren, QueryList } from '@angular/core';
import { SimpleTabComponent } from '../simple-tab/simple-tab.component';

@Component({
  selector: 'app-simple-tabset',
  templateUrl: './simple-tabset.component.html',
  styleUrls: ['./simple-tabset.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SimpleTabsetComponent implements AfterContentInit {

  @ContentChildren(SimpleTabComponent)
  tabs: QueryList<SimpleTabComponent>;

  constructor() {
  }

  selectTab(tab: SimpleTabComponent): void {
    this.tabs.toArray().forEach(t => (t.active = false));
    tab.active = true;
  }

  ngAfterContentInit() {
    // get all active tabs
    const activeTabs = this.tabs.filter(tab => tab.active);

    // if there is no active tab set, activate the first
    if (activeTabs.length === 0) {
      this.selectTab(this.tabs.first);
    }
  }

}
