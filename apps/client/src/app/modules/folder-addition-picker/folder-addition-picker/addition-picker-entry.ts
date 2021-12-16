import { Observable } from 'rxjs';

export interface AdditionPickerEntry {
  $key?: string,
  name: Observable<string>,
  description?: string
}
