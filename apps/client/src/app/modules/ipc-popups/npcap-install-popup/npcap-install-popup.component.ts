import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-npcap-install-popup',
  templateUrl: './npcap-install-popup.component.html',
  styleUrls: ['./npcap-install-popup.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NpcapInstallPopupComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
