import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-folder-addition-picker',
  templateUrl: './folder-addition-picker.component.html',
  styleUrls: ['./folder-addition-picker.component.less']
})
export class FolderAdditionPickerComponent implements OnInit {

  public elements: { $key: string, name: string, description?: string }[] = [];

  constructor() {
  }

  ngOnInit() {
  }

}
