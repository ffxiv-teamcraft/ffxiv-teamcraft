import {Injectable} from '@angular/core';
import {Diff} from './diff';

@Injectable()
export class DiffService {

    /**
     * Creates a Diff report between two objects, it's not a very deep diff but it's able to determine which property has been changed,
     * and which index in a given array.
     * @param before The object before the changes.
     * @param after The object after the changes.
     * @param {string} pathPrefix
     * @returns {Diff}
     */
    diff(before: any, after: any, pathPrefix = ''): Diff {
        const checkedKeys: string[] = [];
        const diff = new Diff();
        for (const beforeKey of Object.keys(before)) {
            if (after[beforeKey] === undefined) {
                // If the property isn't here anymore, add it to deletions.
                diff.deleted.push({
                    path: `${pathPrefix}/${beforeKey}`
                });
            } else {
                if (after[beforeKey] !== before[beforeKey] && !Array.isArray(before[beforeKey]) && !(before[beforeKey] instanceof Object)) {
                    // if it's modified and it's not an array nor an object, add the property name to modified array.
                    diff.modified.push({
                        path: `${pathPrefix}/${beforeKey}`,
                        value: after[beforeKey]
                    });
                } else if (after[beforeKey] !== before[beforeKey]) {
                    // If it's modified and it's an array or an object
                    // Check what has been modified in the array
                    const arrayDiff = this.diff(before[beforeKey], after[beforeKey], `${pathPrefix}/${beforeKey}`);
                    diff.merge(arrayDiff);
                }
            }
            checkedKeys.push(beforeKey);
        }
        for (const afterKey of Object.keys(after).filter(k => checkedKeys.indexOf(k) === -1)) {
            if (before[afterKey] === undefined) {
                diff.added.push({
                    path: `${pathPrefix}/${afterKey}`,
                    value: after[afterKey]
                });
            }
        }
        return diff;
    }

}
