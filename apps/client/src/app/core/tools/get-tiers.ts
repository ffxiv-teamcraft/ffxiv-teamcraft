import { ListRow } from '../../modules/list/model/list-row';
import { topologicalSort } from './topological-sort';

export function getTiers(rows: ListRow[]): ListRow[][] {
  const result = [[]];
  topologicalSort(rows).forEach(row => {
    if (result[0] === undefined) {
      result[0] = [];
    }
    // Default tier is -1, because we want to do +1 to the last requirement tier to define the tier of the current item.
    let requirementsTier = -1;
    for (const requirement of (row.requires || [])) {
      for (let tier = 0; tier < result.length; tier++) {
        if (result[tier].find(r => r.id === requirement.id) !== undefined) {
          requirementsTier = requirementsTier > tier ? requirementsTier : tier;
        }
      }
    }
    const itemTier = requirementsTier + 1;
    if (result[itemTier] === undefined) {
      result[itemTier] = [];
    }
    result[itemTier].push(row);
  });
  return result;
}
