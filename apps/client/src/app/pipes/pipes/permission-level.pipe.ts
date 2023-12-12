import { Pipe, PipeTransform } from '@angular/core';
import { PermissionLevel } from '../../core/database/permissions/permission-level.enum';

@Pipe({
    name: 'permissionLevel',
    standalone: true
})
export class PermissionLevelPipe implements PipeTransform {
  transform(level: number): string {
    return PermissionLevel[level];
  }
}
