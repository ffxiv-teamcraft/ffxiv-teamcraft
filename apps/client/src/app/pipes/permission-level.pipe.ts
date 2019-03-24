import { Pipe, PipeTransform } from '@angular/core';
import { LocalizedDataService } from '../core/data/localized-data.service';
import { I18nName } from '../model/common/i18n-name';
import { PermissionLevel } from '../core/database/permissions/permission-level.enum';

@Pipe({
  name: 'permissionLevel'
})
export class PermissionLevelPipe implements PipeTransform {

  transform(level: number): string {
    return PermissionLevel[level];
  }

}
