import {Injectable} from '@angular/core';

@Injectable()
export class MasterbookService {

    private static BOOKS: { [index: string]: number[] } = {
        'CRP': [8135, 7778, 9336, 12244, 14126, 17869],
        'BSM': [8136, 7779, 9337, 12245, 14127, 17870],
        'ARM': [8137, 7780, 9338, 12246, 14128, 17871],
        'GSM': [8138, 7781, 9339, 12247, 14129, 17872],
        'LTW': [8139, 7782, 9340, 12248, 14130, 17873],
        'WVR': [8140, 7783, 9341, 12249, 14131, 17874],
        'ALC': [8141, 7784, 9342, 12250, 14132, 17875],
        'CUL': [7785, 9343, 12251, 14133, 17876],
        'BTN': [12698, 12699, 12700, 17840, 17841],
        'MIN': [12238, 12239, 12240, 17838, 17839],
        'FSH': [12701, 12702, 12703, 17842, 17843]
    };

    /**
     * Gets the list of books based on a job abbreviation.
     * @param {string} job
     * @returns {number[]}
     */
    public getBooks(job: string): number[] {
        return MasterbookService.BOOKS[job];
    }
}
