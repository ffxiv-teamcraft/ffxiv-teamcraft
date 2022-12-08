import { ListRow } from '../../modules/list/model/list-row';

export function topologicalSort(data: ListRow[]): ListRow[] {
  const res: ListRow[] = [];
  const doneList: boolean[] = [];
  while (data.length > res.length) {
    let resolved = false;

    for (const item of data) {
      if (res.indexOf(item) > -1) {
        // item already in resultset
        continue;
      }
      resolved = true;

      if (item.requires !== undefined) {
        for (const dep of item.requires) {
          // We have to check if it's not a precraft, as some dependencies aren't resolvable inside the current array.
          const depIsInArray = data.find(row => row.id === dep.id) !== undefined;
          if (!doneList[dep.id] && depIsInArray) {
            // there is a dependency that is not met:
            resolved = false;
            break;
          }
        }
      }
      if (resolved) {
        // All dependencies are met:
        doneList[item.id] = true;
        res.push(item);
      }
    }
  }
  return res;
}
