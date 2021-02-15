import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-remove-ads-popup',
  templateUrl: './remove-ads-popup.component.html',
  styleUrls: ['./remove-ads-popup.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RemoveAdsPopupComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
