import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-copyable-name',
  templateUrl: './copyable-name.component.html',
  styleUrls: ['./copyable-name.component.scss']
})
export class CopyableNameComponent {

  @Input()
  tooltip: string;

  @Input()
  name: string;

  @Output()
  afterCopy = new EventEmitter<string>();

  constructor() {
  }
}
